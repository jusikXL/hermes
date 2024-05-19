use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use wormhole_anchor_sdk::wormhole;

pub use super::send_message_context::SEED_PREFIX_SENT;
use crate::{
    errors::OtcMarketError,
    state::{Config, ForeignEmitter, Offer, WormholeEmitter},
};

#[derive(Accounts)]
#[instruction(target_chain: u16, target_token_address: [u8; 32], exchange_rate: u128)]
pub struct CreateOffer<'info> {
    #[account(mut)]
    /// Seller will pay Wormhole fee to post a message.
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
        bump
    )]
    /// Foreign emitter account.
    /// Read-only.
    pub foreign_emitter: Account<'info, ForeignEmitter>,

    #[account(mut)]
    /// seller ata
    pub seller_ata: Account<'info, TokenAccount>,

    pub source_token: Account<'info, Mint>,

    #[account(mut)]
    /// escrow ata
    pub escrow: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = seller,
        seeds = [
            Offer::SEED_PREFIX,
            seller.key().as_ref(), // seller_source_address
            &1u16.to_le_bytes(), // source chain
            &target_chain.to_le_bytes(), // target chain
            &seller_ata.mint.as_ref(), // source token address
            // &source_token.key().as_ref()
            &target_token_address, // target token address 
            &exchange_rate.to_le_bytes()
        ],
        bump,
        space = Offer::MAXIMUM_SIZE
    )]
    /// Offer account.
    pub offer: Account<'info, Offer>,

    /// System program.
    pub system_program: Program<'info, System>,

    /// Token program.
    pub token_program: Program<'info, Token>,

    /// Clock sysvar.
    pub clock: Sysvar<'info, Clock>,

    /// Rent sysvar.
    pub rent: Sysvar<'info, Rent>,
}
