use anchor_lang::prelude::*;

#[event]
pub struct OfferCreated {
    pub offer_id: Pubkey,                // ???
    pub seller_source_address: [u8; 32], // Pubkey?
    pub seller_target_address: [u8; 32],
    pub source_chain: u16,
    pub target_chain: u16,
    pub source_token_address: [u8; 32], // Pubkey?
    pub target_token_address: [u8; 32],
    pub source_token_amount: u64,
    pub exchange_rate: u64,
}
