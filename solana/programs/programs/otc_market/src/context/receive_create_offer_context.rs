use anchor_lang::prelude::*;
use wormhole_anchor_sdk::wormhole;

use crate::{
    errors::OtcMarketError,
    message::OtcMarketMessage,
    state::{ForeignEmitter, Offer},
};

#[derive(Accounts)]
#[instruction(vaa_hash: [u8; 32])]
pub struct ReceiveCreateOffer<'info> {
    #[account(mut)]
    /// Payer will initialize an account that tracks his own message IDs.
    pub payer: Signer<'info>,

    // Wormhole program.
    pub wormhole_program: Program<'info, wormhole::program::Wormhole>,

    #[account(
        seeds = [
            wormhole::SEED_PREFIX_POSTED_VAA,
            &vaa_hash
        ],
        bump,
        seeds::program = wormhole_program
    )]
    /// Verified Wormhole message account. The Wormhole program verified
    /// signatures and posted the account data here. Read-only.
    pub posted: Account<'info, wormhole::PostedVaa<OtcMarketMessage>>,

    #[account(
        seeds = [
            ForeignEmitter::SEED_PREFIX,
            &posted.emitter_chain().to_le_bytes()[..]
        ],
        bump,
        constraint = foreign_emitter.verify(posted.emitter_address()) @ OtcMarketError::InvalidForeignEmitter
    )]
    /// Foreign emitter account. The posted message's `emitter_address` must
    /// agree with the one we have registered for this message's `emitter_chain`
    /// (chain ID). Read-only.
    pub foreign_emitter: Account<'info, ForeignEmitter>,

    #[account(
        init,
        payer = payer,
        space = Offer::MAXIMUM_SIZE
    )]
    pub offer: Account<'info, Offer>,

    /// System program.
    pub system_program: Program<'info, System>,
}
