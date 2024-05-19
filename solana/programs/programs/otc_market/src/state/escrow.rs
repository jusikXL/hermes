use anchor_lang::prelude::*;

#[account]
pub struct Escrow {
    /// PDA bump.
    pub bump: u8,
}

impl Escrow {
    pub const MAXIMUM_SIZE: usize = 8 // discriminator
      + 1 // bump
    ;

    /// AKA `b"escrow"`.
    pub const SEED_PREFIX: &'static [u8; 6] = b"escrow";
}
