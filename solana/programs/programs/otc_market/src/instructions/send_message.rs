use anchor_lang::prelude::*;
use wormhole_anchor_sdk::wormhole;

use crate::{context::*, errors::OtcMarketError, message::OtcMarketMessage};

/// This instruction posts a Wormhole message of some arbitrary size
/// in the form of bytes ([Vec<u8>]). The message is encoded as
/// [OtcMarketMessage::Hello], which serializes a payload ID (1) before the message
/// specified in the instruction. Instead of using the native borsh
/// serialization of [Vec] length (little endian u32), length of the
/// message is encoded as big endian u16 (in EVM, bytes for numerics are
/// natively serialized as big endian).
///
/// See [OtcMarketMessage] enum for serialization implementation.
///
/// # Arguments
///
/// * `message` - Arbitrary message to send out
pub fn send_message(ctx: Context<SendMessage>, message: Vec<u8>) -> Result<()> {
    // If Wormhole requires a fee before posting a message, we need to
    // transfer lamports to the fee collector. Otherwise
    // `wormhole::post_message` will fail.
    let fee = ctx.accounts.wormhole_bridge.fee();
    if fee > 0 {
        solana_program::program::invoke(
            &solana_program::system_instruction::transfer(
                &ctx.accounts.payer.key(),
                &ctx.accounts.wormhole_fee_collector.key(),
                fee,
            ),
            &ctx.accounts.to_account_infos(),
        )?;
    }

    // Invoke `wormhole::post_message`.
    //
    // `wormhole::post_message` requires two signers: one for the emitter
    // and another for the wormhole message data. Both of these accounts
    // are owned by this program.
    //
    // There are two ways to handle the wormhole message data account:
    //   1. Using an extra keypair. You may to generate a keypair outside
    //      of this instruction and pass that keypair as an additional
    //      signer for the transaction. An integrator might use an extra
    //      keypair if the message can be "thrown away" (not easily
    //      retrievable without going back to this transaction hash to
    //      retrieve the message's pubkey).
    //   2. Generate a PDA. If we want some way to deserialize the message
    //      data written by the Wormhole program, we can use an account
    //      with an address derived by this program so we can use the PDA
    //      to access and deserialize the message data.
    //
    // In our example, we use method #2.
    let wormhole_emitter = &ctx.accounts.wormhole_emitter;
    let config = &ctx.accounts.config;

    // There is only one type of message that this example uses to
    // communicate with its foreign counterparts (payload ID == 1).
    let payload: Vec<u8> = OtcMarketMessage::Hello { message }.try_to_vec()?;

    wormhole::post_message(
        CpiContext::new_with_signer(
            ctx.accounts.wormhole_program.to_account_info(),
            wormhole::PostMessage {
                config: ctx.accounts.wormhole_bridge.to_account_info(),
                message: ctx.accounts.wormhole_message.to_account_info(),
                emitter: wormhole_emitter.to_account_info(),
                sequence: ctx.accounts.wormhole_sequence.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
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
        ),
        config.batch_id,
        payload,
        config.finality.try_into().unwrap(),
    )?;

    // Done.
    Ok(())
}
