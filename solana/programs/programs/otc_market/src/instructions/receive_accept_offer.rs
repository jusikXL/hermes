use anchor_lang::prelude::*;
use anchor_spl::token::{transfer_checked, TransferChecked};

use crate::{
    context::receive_accept_offer_context::*,
    errors::OtcMarketError,
    events::OfferAccepted,
    message::{OfferAcceptedMessage, OtcMarketMessage},
    state::offer::Offer,
};

/// This instruction reads a posted verified Wormhole message and verifies
/// that the payload is of type [OtcMarketMessage::Hello] (payload ID == 1). OtcMarketMessage
/// data is stored in a [Received] account.
///
/// See [OtcMarketMessage] enum for deserialization implementation.
///
/// # Arguments
///
/// * `vaa_hash` - Keccak256 hash of verified Wormhole message
pub fn receive_accept_offer(ctx: Context<ReceiveAcceptOffer>, _vaa_hash: [u8; 32]) -> Result<()> {
    let posted_message = &ctx.accounts.posted;

    // check for invalid message order

    if let OtcMarketMessage::OfferAccepted(OfferAcceptedMessage {
        offer_id,
        buyer_ata,
        source_token_amount,
    }) = posted_message.data()
    {
        let offer = &mut ctx.accounts.offer;

        require!(
            offer.source_chain == Offer::CHAIN_ID,
            OtcMarketError::InvalidChain
        );

        require!(offer.key() == *offer_id, OtcMarketError::InvalidOffer);

        require!(
            ctx.accounts.buyer_ata.key() == *buyer_ata,
            OtcMarketError::InvalidBuyerAta
        );

        offer.source_token_amount -= *source_token_amount;

        // Unlock source token.
        {
            let cpi_accounts = TransferChecked {
                from: ctx.accounts.escrow.to_account_info(),
                mint: ctx.accounts.source_token.to_account_info(),
                to: ctx.accounts.buyer_ata.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();

            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            transfer_checked(
                cpi_ctx,
                *source_token_amount,
                ctx.accounts.source_token.decimals,
            )?;
        }

        emit!(OfferAccepted {
            offer_id: *offer_id,
            buyer: ctx.accounts.buyer_ata.owner.key(),
            source_token_amount: *source_token_amount
        });

        Ok(())
    } else {
        Err(OtcMarketError::InvalidMessage.into())
    }
}
