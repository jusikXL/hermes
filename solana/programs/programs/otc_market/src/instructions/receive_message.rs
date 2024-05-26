use anchor_lang::prelude::*;

use crate::{
    context::receive_message_context::*, errors::OtcMarketError, message::OtcMarketMessage,
    state::received::MESSAGE_MAX_LENGTH,
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
pub fn receive_message(ctx: Context<ReceiveMessage>, vaa_hash: [u8; 32]) -> Result<()> {
    let posted_message = &ctx.accounts.posted;


    // checks

    if let OtcMarketMessage::CreateOffer { 
        seller_source_address, 
        seller_target_address, 
        source_chain, 
        target_chain, 
        source_token_address, 
        target_token_address, 
        source_token_amount, 
        exchange_rate
    } = posted_message.data() {
        // OtcMarketMessage cannot be larger than the maximum size of the account.

        require!(
            target_chain == Offer::CHAIN_ID,
            OtcMarketError::InvalidChain,
        );


        {
            let message = OtcMarketMessage::OfferCreated::try_from_slice(&offer_payload)?;
            let offer = &mut ctx.accounts.offer;
    
            // Set offer related params.
            offer.bump = *ctx.bumps.get("offer").ok_or(OtcMarketError::BumpNotFound)?;
            offer.seller_source_address = message.seller_source_address;
            offer.seller_target_address = message.seller_target_address;
            offer.source_chain = message.source_chain;
            offer.target_chain = message.target_chain;
            offer.source_token_address = message.source_token_address;
            offer.target_token_address = message.target_token_address;
            offer.source_token_amount = message.source_token_amount;
            offer.exchange_rate = message.exchange_rate;
            // TODO: can be refactored ❓
        }
    
    
        // Emit event.
        emit!(OfferCreated {
            offer_id: ctx.accounts.offer.key(),
            ctx.accounts.offer.seller_source_address,
            ctx.accounts.offer.seller_target_address,
            ctx.accounts.offer.source_chain,
            ctx.accounts.offer.target_chain,
            ctx.accounts.offer.source_token_address,
            ctx.accounts.offer.target_token_address,
            ctx.accounts.offer.source_token_amount,
            ctx.accounts.offer.exchange_rate,
        });

        // Save batch ID, keccak256 hash and message payload.
        let received = &mut ctx.accounts.received;
        received.batch_id = posted_message.batch_id();
        received.wormhole_message_hash = vaa_hash;
        received.message = message.clone();

        // Done
        Ok(())
    } else {
        Err(OtcMarketError::InvalidMessage.into())
    }
}
