use anchor_lang::prelude::*;
use anchor_spl::token::{transfer_checked, TransferChecked};
use std::convert::TryFrom;
use wormhole_anchor_sdk::wormhole;

use crate::{
    context::accept_offer_context::*,
    errors::OtcMarketError,
    events::OfferAccepted,
    message::{OfferAcceptedMessage, OtcMarketMessage},
    state::offer::*,
};

pub fn accept_offer(
    ctx: Context<AcceptOffer>,
    source_token_amount: u64,
    decimals: u8,
) -> Result<()> {
    // Validate offer params.
    {
        // 1. Should fail if payment for msg fee failed.
        let fee = ctx.accounts.wormhole_bridge.fee();
        if fee > 0 {
            solana_program::program::invoke(
                &solana_program::system_instruction::transfer(
                    &ctx.accounts.buyer.key(),
                    &ctx.accounts.wormhole_fee_collector.key(),
                    fee,
                ),
                &ctx.accounts.to_account_infos(),
            )?;
        }
        // Should fail if chain is not target chain
        require!(
            ctx.accounts.offer.target_chain != Offer::CHAIN_ID,
            OtcMarketError::InvalidChain
        );

        // Should fail if target token does not match
        require!(
            ctx.accounts.target_token.key()
                == Pubkey::new_from_array(ctx.accounts.offer.target_token_address),
            OtcMarketError::InvalidTargetToken,
        );

        // Should fail if seller ata does not match
        require!(
            ctx.accounts.seller_ata.key()
                == Pubkey::new_from_array(ctx.accounts.offer.seller_target_address),
            OtcMarketError::InvalidSellerAta
        );

        // Should fail if insufficient amount.
        require!(
            source_token_amount > Offer::MINIMUM_AMOUNT,
            OtcMarketError::InsufficientAmount,
        );
        // Should fail if excessive amount.
        require!(
            source_token_amount <= ctx.accounts.offer.source_token_amount,
            OtcMarketError::ExcessiveAmount
        );
    }
    let offer = &mut ctx.accounts.offer;
    let buyer = &mut ctx.accounts.buyer;

    let ether = 10_u128.pow(u32::try_from(decimals).unwrap());
    let target_token_amount: u64 = u64::try_from(
        u128::try_from(source_token_amount).unwrap() * u128::try_from(offer.exchange_rate).unwrap()
            / ether,
    )
    .unwrap();
    let fee: u64 = target_token_amount / 100; // 1%

    offer.source_token_amount -= source_token_amount;

    emit!(OfferAccepted {
        offer_id: offer.key(),
        buyer: buyer.key(),
        source_token_amount: source_token_amount,
    });
    // Lock fee (target token)
    {
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.buyer_ata.to_account_info(),
            mint: ctx.accounts.target_token.to_account_info(),
            to: ctx.accounts.escrow.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        transfer_checked(cpi_ctx, fee, decimals)?;
    }

    // Transfer target tocken
    {
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.buyer_ata.to_account_info(),
            mint: ctx.accounts.target_token.to_account_info(),
            to: ctx.accounts.seller_ata.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        transfer_checked(cpi_ctx, target_token_amount - fee, decimals)?;
    }

    // Sending cross chain message

    let wormhole_emitter = &ctx.accounts.wormhole_emitter;
    let config = &ctx.accounts.config;

    let payload: Vec<u8> = OtcMarketMessage::OfferAccepted(OfferAcceptedMessage {
        offer_id: ctx.accounts.offer.key(),
        buyer_ata: ctx.accounts.buyer.key(),
        source_token_amount: source_token_amount,
    })
    .try_to_vec()?;

    wormhole::post_message(
        CpiContext::new_with_signer(
            ctx.accounts.wormhole_program.to_account_info(),
            wormhole::PostMessage {
                config: ctx.accounts.wormhole_bridge.to_account_info(),
                message: ctx.accounts.wormhole_message.to_account_info(),
                emitter: wormhole_emitter.to_account_info(),
                sequence: ctx.accounts.wormhole_sequence.to_account_info(),
                payer: ctx.accounts.buyer.to_account_info(),
                fee_collector: ctx.accounts.wormhole_fee_collector.to_account_info(),
                clock: ctx.accounts.clock.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
            &[
                &[
                    SEED_PREFIX_SENT,
                    &ctx.accounts.wormhole_sequence.next_value().to_le_bytes()[..],
                    &[*ctx
                        .bumps
                        .get("wormhole_message")
                        .ok_or(OtcMarketError::BumpNotFound)?],
                ],
                &[wormhole::SEED_PREFIX_EMITTER, &[wormhole_emitter.bump]],
            ],
            // maybe offer should also sign ❓
        ),
        config.batch_id,
        payload,
        config.finality.try_into().unwrap(),
    )?;

    Ok(())
}
