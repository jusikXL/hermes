use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use wormhole_anchor_sdk::wormhole;

pub use super::send_message_context::SEED_PREFIX_SENT;
use crate::{
    errors::OtcMarketError,
    state::{Config, Escrow, ForeignEmitter, Offer, WormholeEmitter},
};

#[derive(Accounts)]
#[instruction(
    offer_source_chain: u16
)]
pub struct AcceptOffer<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        seeds = [Config::SEED_PREFIX],
        bump,
    )]
    /// Config account. Wormhole PDAs specified in the config are checked
    /// against the Wormhole accounts in this context. Read-only.
    pub config: Account<'info, Config>,

    /// Wormhole program.
    pub wormhole_program: Program<'info, wormhole::program::Wormhole>,

    #[account(
        mut,
        address = config.wormhole.bridge @ OtcMarketError::InvalidWormholeConfig
    )]
    /// Wormhole bridge data. [`wormhole::post_message`] requires this account
    /// be mutable.
    pub wormhole_bridge: Account<'info, wormhole::BridgeData>,

    #[account(
        mut,
        address = config.wormhole.fee_collector @ OtcMarketError::InvalidWormholeFeeCollector
    )]
    /// Wormhole fee collector. [`wormhole::post_message`] requires this
    /// account be mutable.
    pub wormhole_fee_collector: Account<'info, wormhole::FeeCollector>,

    #[account(
        seeds = [WormholeEmitter::SEED_PREFIX],
        bump,
    )]
    /// Program's emitter account. Read-only.
    pub wormhole_emitter: Account<'info, WormholeEmitter>,

    #[account(
        mut,
        address = config.wormhole.sequence @ OtcMarketError::InvalidWormholeSequence
    )]
    /// Emitter's sequence account. [`wormhole::post_message`] requires this
    /// account be mutable.
    pub wormhole_sequence: Account<'info, wormhole::SequenceTracker>,

    #[account(
        mut,
        seeds = [
            SEED_PREFIX_SENT,
            &wormhole_sequence.next_value().to_le_bytes()[..]
        ],
        bump,
    )]
    /// CHECK: Wormhole Message. [`wormhole::post_message`] requires this
    /// account be mutable.
    pub wormhole_message: UncheckedAccount<'info>,

    #[account(
        seeds = [
            ForeignEmitter::SEED_PREFIX,
            &offer_source_chain.to_le_bytes()[..]
        ],
        bump,
        // maybe some further verification needed ❓
    )]
    /// Foreign emitter account. Source OTC Market.
    /// Read-only.
    pub foreign_emitter: Account<'info, ForeignEmitter>,

    #[account()]
    /// Target token account.
    /// Used to carry `transfer_checked`.
    ///
    /// ❗Needs verification❗
    pub target_token: Account<'info, Mint>,

    #[account(
        mut,
        constraint=buyer_ata.owner == buyer.key(),
        constraint=buyer_ata.mint == target_token.key()
    )]
    /// Buyer's target token account
    /// We transfer `target_token_amount` from this account to seller and escrow (fee).
    pub buyer_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    /// Seller's target token account
    /// We transfer `target_token_amount - fee` from buyer_ata to seller_ata.
    ///
    /// ❗Needs verification❗
    pub seller_ata: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        seeds=[Escrow::SEED_PREFIX, target_token.key().as_ref()],
        bump,
        token::mint=target_token,
        token::authority=config
    )]
    /// Escrow token account.
    pub escrow: Account<'info, TokenAccount>,

    #[account(mut)]
    /// Offer account. Has a unique pda.
    ///
    /// ❓❗Needs verification❗❓
    pub offer: Account<'info, Offer>,

    /// Token program.
    pub token_program: Program<'info, Token>,

    /// System program.
    pub system_program: Program<'info, System>,

    /// Clock sysvar.
    pub clock: Sysvar<'info, Clock>,

    /// Rent sysvar.
    pub rent: Sysvar<'info, Rent>,
}
