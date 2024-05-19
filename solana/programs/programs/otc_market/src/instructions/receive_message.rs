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

    if let OtcMarketMessage::Hello { message } = posted_message.data() {
        // OtcMarketMessage cannot be larger than the maximum size of the account.
        require!(
            message.len() <= MESSAGE_MAX_LENGTH,
            OtcMarketError::InvalidMessage,
        );

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
