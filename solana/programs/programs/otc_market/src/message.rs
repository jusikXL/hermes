use anchor_lang::prelude::*;

#[derive(Clone, AnchorDeserialize, AnchorSerialize)]
pub enum OtcMarketMessage {
    Alive { program_id: Pubkey },
    Hello { message: Vec<u8> },
    OfferCreated(OfferCreatedMessage),
    OfferAccepted(OfferAcceptedMessage),
}

#[derive(Clone, AnchorDeserialize, AnchorSerialize)]
pub struct OfferCreatedMessage {
    pub offer_id: Pubkey,
    pub seller_source_address: [u8; 32],
    pub seller_target_address: [u8; 32],
    pub source_chain: u16,
    pub target_chain: u16,
    pub source_token_address: [u8; 32],
    pub target_token_address: [u8; 32],
    pub source_token_amount: u64,
    pub exchange_rate: u64,
}

#[derive(Clone, AnchorDeserialize, AnchorSerialize)]
pub struct OfferAcceptedMessage {
    pub offer_id: Pubkey,
    pub buyer_ata: Pubkey,
    pub source_token_amount: u64,
}
