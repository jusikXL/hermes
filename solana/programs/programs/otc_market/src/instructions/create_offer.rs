use anchor_lang::prelude::*;
use anchor_spl::token::{transfer_checked, TransferChecked};
use wormhole_anchor_sdk::wormhole;

use crate::{
    context::create_offer_context::*, errors::OtcMarketError, events::OfferCreated,
    message::OtcMarketMessage, message::OfferCreatedMessage, state::offer::*,
};

pub fn create_offer(
    ctx: Context<CreateOffer>,
    target_chain: u16,
    seller_target_address: [u8; 32],
    target_token_address: [u8; 32],
    source_token_amount: u64,
    exchange_rate: u64,
    decimals: u8,
) -> Result<()> {
    // Validate offer params.
    {
        // 1. Should fail if payment for msg fee failed.
        let fee = ctx.accounts.wormhole_bridge.fee();
        if fee > 0 {
            solana_program::program::invoke(
                &solana_program::system_instruction::transfer(
                    &ctx.accounts.seller.key(),
                    &ctx.accounts.wormhole_fee_collector.key(),
                    fee,
                ),
                &ctx.accounts.to_account_infos(),
            )?;
        }

        // 2. Should fail if the foreign emitter is not listed.

        // 3. Should fail if insufficient amount.
        require!(
            source_token_amount > Offer::MINIMUM_AMOUNT,
            OtcMarketError::InsufficientAmount,
        );

        // 4. Should fail if insufficient rate.
        require!(
            exchange_rate > Offer::MINIMUM_RATE,
            OtcMarketError::InsufficientRate,
        );

        // 5. should fail if offer already exists | https://www.rareskills.io/post/init-if-needed-anchor.
    }

    let seller_source_address = ctx.accounts.seller.key().to_bytes();
    let source_token_address = ctx.accounts.source_token.key().to_bytes();
    let source_chain = Offer::CHAIN_ID;

    // Hash offer.
    {
        let offer = &mut ctx.accounts.offer;

        // Set offer related params.
        offer.bump = *ctx.bumps.get("offer").ok_or(OtcMarketError::BumpNotFound)?;
        offer.seller_source_address = seller_source_address;
        offer.seller_target_address = seller_target_address;
        offer.source_chain = source_chain;
        offer.target_chain = target_chain;
        offer.source_token_address = source_token_address;
        offer.target_token_address = target_token_address;
        offer.source_token_amount = source_token_amount;
        offer.exchange_rate = exchange_rate;
        // TODO: can be refactored ❓
    }

    // Emit event.
    emit!(OfferCreated {
        offer_id: ctx.accounts.offer.key(),
        seller_source_address,
        seller_target_address,
        source_chain,
        target_chain,
        source_token_address,
        target_token_address,
        source_token_amount,
        exchange_rate,
    });

    // Lock source token.
    {
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.seller_ata.to_account_info(),
            mint: ctx.accounts.source_token.to_account_info(),
            to: ctx.accounts.escrow.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        transfer_checked(cpi_ctx, source_token_amount, decimals)?;
    }

    // Construct payload, invoke `wormhole::post_message`.
    let wormhole_emitter = &ctx.accounts.wormhole_emitter;
    let config = &ctx.accounts.config;

    let payload: Vec<u8> = OtcMarketMessage::OfferCreated(OfferCreatedMessage {
        offer_id: ctx.accounts.offer.key(),
        seller_source_address,
        seller_target_address,
        source_chain,
        target_chain,
        source_token_address,
        target_token_address,
        source_token_amount,
        exchange_rate,
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
                payer: ctx.accounts.seller.to_account_info(),
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
