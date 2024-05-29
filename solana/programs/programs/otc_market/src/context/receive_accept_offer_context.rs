use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use wormhole_anchor_sdk::wormhole;

use crate::{
    errors::OtcMarketError,
    message::OtcMarketMessage,
    state::{Config, Escrow, ForeignEmitter, Offer},
};

#[derive(Accounts)]
#[instruction(vaa_hash: [u8; 32])]
pub struct ReceiveAcceptOffer<'info> {
    #[account(mut)]
    /// Payer will initialize an account that tracks his own message IDs.
    pub payer: Signer<'info>,

    #[account(
        seeds = [Config::SEED_PREFIX],
        bump,
    )]
    /// Config account. Wormhole PDAs specified in the config are checked
    /// against the Wormhole accounts in this context. Read-only.
    pub config: Account<'info, Config>,

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

    #[account()]
    /// Source token account.
    /// Used to carry `transfer_checked`.
    pub source_token: Account<'info, Mint>,

    #[account(
        seeds=[Escrow::SEED_PREFIX, source_token.key().as_ref()],
        bump,
        token::mint=source_token,
        token::authority=config
    )]
    /// Escrow token account.
    pub escrow: Account<'info, TokenAccount>,

    #[account(mut)]
    /// Buyer's target token account
    /// We transfer `target_token_amount` from this account to seller and escrow (fee).
    pub buyer_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub offer: Account<'info, Offer>,

    /// Token program.
    pub token_program: Program<'info, Token>,

    /// System program.
    pub system_program: Program<'info, System>,
}
