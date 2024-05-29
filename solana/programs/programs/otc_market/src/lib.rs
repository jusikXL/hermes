use anchor_lang::prelude::*;

pub use context::*;
pub use instructions::*;

pub mod context;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod message;
pub mod state;

declare_id!("n44B2i7iW7txBg3JqHrJPaeiF83b2jk95SHg28SutyW");

#[program]
/// # Hello World (Scaffolding Example #1)
///
/// ## Program Accounts
/// * [Config]
/// * [ForeignEmitter]
/// * [Received]
/// * [WormholeEmitter]
pub mod otc_market {
    use super::*;

    /// See [initialize].
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::initialize(ctx)
    }

    /// See [register_emitter].
    pub fn register_emitter(
        ctx: Context<RegisterEmitter>,
        chain: u16,
        address: [u8; 32],
    ) -> Result<()> {
        instructions::register_emitter::register_emitter(ctx, chain, address)
    }

    /// See [send_message].
    pub fn send_message(ctx: Context<SendMessage>, message: Vec<u8>) -> Result<()> {
        instructions::send_message::send_message(ctx, message)
    }

    /// See [create_offer].
    pub fn create_offer(
        ctx: Context<CreateOffer>,
        target_chain: u16,
        seller_target_address: [u8; 32],
        target_token_address: [u8; 32],
        source_token_amount: u64,
        exchange_rate: u64,
        decimals: u8,
    ) -> Result<()> {
        instructions::create_offer::create_offer(
            ctx,
            target_chain,
            seller_target_address,
            target_token_address,
            source_token_amount,
            exchange_rate,
            decimals,
        )
    }

    /// See [accept_offer].
    pub fn accept_offer(
        ctx: Context<AcceptOffer>,
        source_token_amount: u64,
        decimals: u8,
    ) -> Result<()> {
        instructions::accept_offer::accept_offer(ctx, source_token_amount, decimals)
    }

    /// See [receive_message].
    pub fn receive_message(ctx: Context<ReceiveMessage>, vaa_hash: [u8; 32]) -> Result<()> {
        instructions::receive_message::receive_message(ctx, vaa_hash)
    }
}
