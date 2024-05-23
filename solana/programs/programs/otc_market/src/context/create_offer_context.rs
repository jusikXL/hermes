use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use wormhole_anchor_sdk::wormhole;

pub use super::send_message_context::SEED_PREFIX_SENT;
use crate::{
    errors::OtcMarketError,
    state::{Config, ForeignEmitter, Offer, WormholeEmitter, Escrow},
};

#[derive(Accounts)]
#[instruction(
    target_chain: u16,
    target_token_address: [u8; 32], 
    exchange_rate: u64
)]
pub struct CreateOffer<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

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
            &target_chain.to_le_bytes()[..]
        ],
        bump,
        // maybe some further verification needed ❓
    )]
    /// Foreign emitter account. Target OTC Market.
    /// Read-only.
    pub foreign_emitter: Account<'info, ForeignEmitter>,

    #[account(
        mut,
        constraint=seller_ata.owner == seller.key(),
        constraint=seller_ata.mint == source_token.key()
    )]
    /// Seller's source token account
    /// We transfer `source_token_amount` from this account to escrow.
    pub seller_ata: Account<'info, TokenAccount>,

    #[account()]
    /// Source token account. 
    /// Used to carry `transfer_checked`.
    pub source_token: Account<'info, Mint>,

    #[account(
        init,
        payer = seller,
        seeds=[Escrow::SEED_PREFIX, source_token.key().as_ref()],
        bump,
        token::mint=source_token,
        token::authority=offer
    )]
    /// Escrow token account.
    pub escrow: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = seller,
        seeds = [
            Offer::SEED_PREFIX,
            seller.key().as_ref(), // seller source address ❓
            &Offer::CHAIN_ID.to_le_bytes(), // source chain
            &target_chain.to_le_bytes(), // target chain
            &source_token.key().as_ref(), // source token address ❓
     //      &target_token_address, // target token address ❓
     //      &exchange_rate.to_le_bytes() // exchange rate
        ],
        bump,
        space = Offer::MAXIMUM_SIZE
    )]
    /// Offer account. Has a unique pda.
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
