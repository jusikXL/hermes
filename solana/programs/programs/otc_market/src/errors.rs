use anchor_lang::prelude::error_code;

#[error_code]
/// Errors relevant to this program's malfunction.
pub enum OtcMarketError {
    #[msg("InvalidWormholeConfig")]
    /// Specified Wormhole bridge data PDA is wrong.
    InvalidWormholeConfig,

    #[msg("InvalidWormholeFeeCollector")]
    /// Specified Wormhole fee collector PDA is wrong.
    InvalidWormholeFeeCollector,

    #[msg("InvalidWormholeEmitter")]
    /// Specified program's emitter PDA is wrong.
    InvalidWormholeEmitter,

    #[msg("InvalidWormholeSequence")]
    /// Specified emitter's sequence PDA is wrong.
    InvalidWormholeSequence,

    #[msg("InvalidSysvar")]
    /// Specified sysvar is wrong.
    InvalidSysvar,

    #[msg("OwnerOnly")]
    /// Only the program's owner is permitted.
    OwnerOnly,

    #[msg("InvalidForeignEmitter")]
    /// Specified foreign emitter has a bad chain ID or zero address.
    InvalidForeignEmitter,

    #[msg("BumpNotFound")]
    /// Bump not found in `bumps` map.
    BumpNotFound,

    #[msg("InvalidMessage")]
    /// Deserialized message has unexpected payload type.
    InvalidMessage,

    #[msg("InsufficientAmount")]
    /// Too small amount.
    InsufficientAmount,

    #[msg("ExcessiveAmount")]
    /// Too large amount
    ExcessiveAmount,

    #[msg("InsufficientRate")]
    /// Too small rate.
    InsufficientRate,

    #[msg("InvalidChain")]
    InvalidChain,

    #[msg("InvalidOffer")]
    InvalidOffer,

    #[msg("InvalidTargetToken")]
    // Provided target_token does not match with one in offer
    InvalidTargetToken,

    #[msg("InvalidSellerAta")]
    // Provided seller_ata does not match with one in offer
    InvalidSellerAta,

    #[msg("InvalidBuyerAta")]
    // Provided buyer_ata does not match with one in offer
    InvalidBuyerAta,
}
