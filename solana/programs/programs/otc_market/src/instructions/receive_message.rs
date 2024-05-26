use anchor_lang::prelude::*;

use crate::{
    context::receive_message_context::*, errors::OtcMarketError, events::OfferCreated,
    message::OtcMarketMessage, message::OfferCreatedMessage, state::offer::Offer,
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
pub fn receive_message(ctx: Context<ReceiveMessage>, _vaa_hash: [u8; 32]) -> Result<()> {
    let posted_message = &ctx.accounts.posted;

    // check for invalid message order

    if let OtcMarketMessage::OfferCreated(OfferCreatedMessage {
        offer_id,
        seller_source_address,
        seller_target_address,
        source_chain,
        target_chain,
        source_token_address,
        target_token_address,
        source_token_amount,
        exchange_rate,
    }) = posted_message.data()
    {
        // OtcMarketMessage cannot be larger than the maximum size of the account.

        require!(
            *target_chain == Offer::CHAIN_ID,
            OtcMarketError::InvalidChain,
        );
        let offer = &mut ctx.accounts.offer;

        require!(*offer_id == offer.key(), OtcMarketError::InvalidOffer);

        // Set offer related params.
        {
            offer.bump = *ctx.bumps.get("offer").ok_or(OtcMarketError::BumpNotFound)?;
            offer.seller_source_address = *seller_source_address;
            offer.seller_target_address = *seller_target_address;
            offer.source_chain = *source_chain;
            offer.target_chain = *target_chain;
            offer.source_token_address = *source_token_address;
            offer.target_token_address = *target_token_address;
            offer.source_token_amount = *source_token_amount;
            offer.exchange_rate = *exchange_rate;
            // TODO: can be refactored ❓
        }

        // Emit event.
        emit!(OfferCreated {
            offer_id: ctx.accounts.offer.key(),
            seller_source_address: *seller_source_address,
            seller_target_address: *seller_target_address,
            source_chain: *source_chain,
            target_chain: *target_chain,
            source_token_address: *source_token_address,
            target_token_address: *target_token_address,
            source_token_amount: *source_token_amount,
            exchange_rate: *exchange_rate,
        });

        // Done
        Ok(())
    } else {
        Err(OtcMarketError::InvalidMessage.into())
    }
}
