// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOtcMarket {
    enum CrossChainMessages {
        OfferCreated,
        OfferAccepted
    }

    struct Offer {
        address sellerSourceAddress;
        address sellerTargetAddress;
        uint16 sourceChain;
        uint16 targetChain;
        address sourceTokenAddress;
        address targetTokenAddress;
        uint256 sourceTokenAmount;
        uint256 exchangeRate;
    }

    error InvalidPrice(uint256 amount, uint256 exchangeRate);
    error UnsupportedChain(uint16 chain);
    error InsufficientValue(uint256 sent, uint256 required);
    error OfferAlreadyExists(uint256 offerId);
    error OnlySeller(address operator);
    error OnlyOtc(address operator);
    error InvalidTarget(address target);
    error NonexistentOffer(uint256 offerId);

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
    event OfferReceived(uint256 indexed offerId);
    event OfferClosed(uint256 indexed offerId);
    event OfferAccepted(uint256 indexed offerId, address indexed buyer);
    event OfferCancelled(uint256 indexed offerId);

    function hashOffer(
        address seller,
        uint16 sourceChain,
        uint16 targetChain,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint256 exchangeRate
    ) external pure returns (uint256 offerId);

    function createOffer(
        uint16 targetChain,
        address sellerTargetAddress,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint256 sourceTokenAmount,
        uint256 exchangeRate
    ) external payable returns (uint256 newOfferId);

    function acceptOffer(uint256 offerId) external payable;
}
