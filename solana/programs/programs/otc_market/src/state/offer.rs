use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
/// Offer account.
pub struct Offer {
    pub bump: u8,
    pub seller_source_address: [u8; 32],
    pub seller_target_address: [u8; 32],
    pub source_chain: u16,
    pub target_chain: u16,
    pub source_token_address: [u8; 32],
    pub target_token_address: [u8; 32],
    pub source_token_amount: u64, // ❓
    pub exchange_rate: u64,       // ❓
}

impl Offer {
    pub const CHAIN_ID: u16 = 1;

    pub const MINIMUM_AMOUNT: u64 = u64::pow(10, 12);
    pub const MINIMUM_RATE: u64 = u64::pow(10, 8);

    pub const MAXIMUM_SIZE: usize = 8 // discriminator
        + 1 // bump 
        + 32 // seller_source_address
        + 32 // seller_target_address
        + 2 // source_chain
        + 2 // target_chain
        + 32 // source_token_address
        + 32 // target_token_address
        + 8 // source_token_amount
        + 8 // exchange_rate
    ;

    /// AKA `b"offer"`.
    pub const SEED_PREFIX: &'static [u8; 5] = b"offer";
}

#[cfg(test)]
pub mod test {
    use super::*;
    use std::mem::size_of;

    #[test]
    fn test_offer() -> Result<()> {
        assert_eq!(
            Offer::MAXIMUM_SIZE,
            size_of::<u64>()
                + size_of::<[u8; 32]>()
                + size_of::<[u8; 32]>()
                + size_of::<u16>()
                + size_of::<u16>()
                + size_of::<[u8; 32]>()
                + size_of::<[u8; 32]>()
                + size_of::<u64>()
                + size_of::<u64>()
        );

        Ok(())
    }
}
