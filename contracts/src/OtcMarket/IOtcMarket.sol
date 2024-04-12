// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface of the RXRC4 i.e. Royex request for comment 4 or OTC market.
 */
interface IOtcMarket {
    /**
     * @dev Offer structure.
     */

    struct Offer {
        address seller;
        //
        uint16 sourceChain;
        uint16 targetChain;
        //
        address sourceTokenAddress;
        address targetTokenAddress;
        //
        uint256 sourceTokenAmount;
        uint256 exchangeRate;
    }

    error SomeError();

    /**
     * @dev Zero was provided as an amount.
     */
    error InvalidAmount();

    /**
     * @dev Chain is not supported.
     */
    error UnsupportedChain(uint16 chain);

    /**
     * @dev The minimum stablecoin amount to create an offer is 1 * 10^18 or 1$.
     */
    error InsufficientStablecoinAmount(
        uint256 stablecoinAmount,
        uint256 minStablecoinAmount
    );

    /**
     * @dev Cannot recreate the same offer.
     */
    error OfferAlreadyExists(uint256 offerId);

    /**
     * @dev The offer of the `offerId` is not active.
     */
    error OfferNotFound(uint256 offerId);

    /**
     * @dev Only the offer seller can cancel the offer.
     */
    error UnauthorizedOfferCancellation(address operator, address seller);

    /**
     * @dev Cannot withdrawn more than the available fee revenue.
     */
    error InsufficientTradingFeeRevenue(
        uint256 requestedAmount,
        uint256 availableAmount
    );

    event OfferReceived(uint256 offerId);

    /**
     * @dev Emmited when an offer is created.
     */
    event OfferCreated(
        uint256 offerId,
        address seller,
        uint16 sourceChain,
        uint16 targetChain,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint256 sourceTokenAmount,
        uint256 exchangeRate
    );

    /**
     * @dev Emmited when the offer is accepted.
     */
    event OfferAccepted(uint256 indexed offerId, address indexed buyer);

    /**
     * @dev Emmited when the offer is canceled.
     */
    event OfferCancelled(uint256 indexed offerId);

    /**
    //  * @dev Hashing function used to (re)build the offer id from its details.
    //  */
    // function hashOffer(
    //     address seller,
    //     uint256 royaltyTokenAmount,
    //     uint256 stablecoinAmount
    // ) external returns (uint256 offerId);

    // /**
    //  * @dev Function to create a new offer.
    //  *
    //  * NOTE: seller must approve the `royaltyTokenAmount` needed for trade.
    //  */
    // function createOffer(
    //     uint256 royaltyTokenAmount,
    //     uint256 stablecoinAmount
    // ) external returns (uint256 offerId);

    // /**
    //  * @dev Function to cancel the offer.
    //  *
    //  * NOTE: caller must be the offer seller.
    //  */
    // function cancelOffer(uint256 offerId) external;

    // /**
    //  * @dev Function to accept the offer.
    //  *
    //  * NOTE: buyer must approve the `stablecoinAmount` needed for trade.
    //  */
    // function acceptOffer(uint256 offerId) external;

    // function state(uint256 offerId) external view returns (OfferState);
}