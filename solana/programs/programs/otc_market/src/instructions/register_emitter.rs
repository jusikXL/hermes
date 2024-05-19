use anchor_lang::prelude::*;
use wormhole_anchor_sdk::wormhole;

use crate::{context::*, errors::OtcMarketError};

/// This instruction registers a new foreign emitter (from another network)
/// and saves the emitter information in a ForeignEmitter account. This
/// instruction is owner-only, meaning that only the owner of the program
/// (defined in the [Config] account) can add and update emitters.
///
/// # Arguments
///
/// * `ctx`     - `RegisterForeignEmitter` context
/// * `chain`   - Wormhole Chain ID
/// * `address` - Wormhole Emitter Address
pub fn register_emitter(
    ctx: Context<RegisterEmitter>,
    chain: u16,
    address: [u8; 32],
) -> Result<()> {
    // Foreign emitter cannot share the same Wormhole Chain ID as the
    // Solana Wormhole program's. And cannot register a zero address.
    require!(
        chain > 0 && chain != wormhole::CHAIN_ID_SOLANA && !address.iter().all(|&x| x == 0),
        OtcMarketError::InvalidForeignEmitter,
    );

    // Save the emitter info into the ForeignEmitter account.
    let foreign_emitter = &mut ctx.accounts.foreign_emitter;
    foreign_emitter.chain = chain;
    foreign_emitter.address = address;

    // Done.
    Ok(())
}
