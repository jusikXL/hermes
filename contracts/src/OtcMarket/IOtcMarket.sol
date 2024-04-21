// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface of the {OtcMarket}.
 */
interface IOtcMarket {
    enum CrossChainMessages {
        OfferCreated,
        OfferAccepted,
        OfferCancelAppeal,
        OfferCanceled
    }

    struct Offer {
        address sellerSourceAddress;
        address sellerTargetAddress;
        uint16 sourceChain;
        uint16 targetChain;
        address sourceTokenAddress;
        address targetTokenAddress;
        uint256 sourceTokenAmount;
        uint256 exchangeRate; // price per source token in target token units
    }

    struct ChainInfo {
        address otcMarket;
        uint256 lastEmittedMessage;
        uint256 lastReceivedMessage;
    }

    /**
     * @dev The message before the last emmited message does not match the last received one.
     * The received message shall execute later.
     */
    error InvalidMessageOrder(uint256 recentReceivedMessage);

    /**
     * @dev Zero as amount or exchange rate
     */
    error InvalidPrice(uint256 amount, uint256 exchangeRate);

    /**
     * @dev Provided value is less than required.
     */
    error InsufficientValue(uint256 provided, uint256 required);

    /**
     * @dev Cannot create the same offer. You can top up the existing offer.
     */
    error OfferAlreadyExists(uint256 offerId);

    /**
     * @dev The account is not the offer seller.
     */
    error OnlySeller(address account);

    /**
     * @dev The account is not our OTC.
     */
    error OnlyOtc(address account);

    /**
     * @dev The account is not a Wormhole Relayer.
     */
    error OnlyWormholeRelayer(address operator);

    /**
     * @dev Happens when
     * - the chain is not supported.
     * - transaction was initiated on the wrong chain.
     * - message was relayed to the wrong chain.
     * EXAMPLE:
     * 1. Tried to create an offer to a not whitelisted chain.
     * 2. Tried to create an offer from source to source.
     * 3. Tried to accept the offer not on a target chain.
     * 4. Tried to cancel the offer not on a source chain.
     * 5. Offer between otc1 and otc2 was created/accepted/canceled
     *   but someone relayed message to otc3.
     */
    error InvalidChain(uint16 chain);

    /**
     * @dev The offer id does not exist.
     */
    error NonexistentOffer(uint256 offerId);

    /**
     * @dev Received cross chain message is not supported.
     */
    error UnsupportedMessage();

    /**
     * @dev Emmited when
     * - otc market is listed or updated
     */
    event OtcMarketListed(uint16 chain, address otcMarket);

    /**
     * @dev Emmited when
     * - offer is created on source chain
     * - offer created message came to target chain.
     */
    event OfferCreated(
        uint256 indexed offerId,
        address sellerSourceAddress,
        address sellerTargetAddress,
        uint16 indexed sourceChain,
        uint16 indexed targetChain,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint256 sourceTokenAmount,
        uint256 exchangeRate
    );

    /**
     * @dev Emmited when
     * - offer is accepted on target chain
     * - offer accepted message came to source chain.
     */
    event OfferAccepted(uint256 indexed offerId, address indexed buyer);

    /**
     * @dev Emmited when
     * - cancel offer appeal message came to target chain
     * - cancel offer message came back to source chain.
     */
    event OfferCanceled(uint256 indexed offerId);

    /**
     * @dev Hashing function used to (re)build the offer id from its params.
     */
    function hashOffer(
        address seller,
        uint16 sourceChain,
        uint16 targetChain,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint256 exchangeRate
    ) external pure returns (uint256 offerId);

    /**
     * @dev Function to create a new offer.
     */
    function createOffer(
        uint16 targetChain,
        address sellerTargetAddress,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint256 sourceTokenAmount,
        uint256 exchangeRate
    ) external payable returns (uint256 newOfferId);

    /**
     * @dev Function to accept the offer.
     */
    function acceptOffer(uint256 offerId) external payable;

    /**
     * @dev Function to cancel the offer.
     */
    function cancelOffer(uint256 offerId, uint256 targetCost) external payable;
}
