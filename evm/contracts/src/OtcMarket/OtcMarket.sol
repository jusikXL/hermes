// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IOtcMarket} from "./IOtcMarket.sol";

/**
 * @dev See {IOtcMarket}.
 */
abstract contract OtcMarket is IOtcMarket, Ownable {
    uint128 public constant MINIMUM_EXCHANGE_RATE = 10 ** 8;
    uint128 public constant MINIMUM_AMOUNT = 10 ** 12;
    uint256 public constant FEE = 100;

    uint16 public immutable chain;

    mapping(uint16 chain => ChainInfo) public otherOtcMarkets;
    mapping(uint256 offerId => Offer) public offers;

    constructor(uint16 _chain, address _initialOwner) Ownable(_initialOwner) {
        chain = _chain;
    }

    function listOtcMarket(
        uint16 targetChain,
        address otcMarket
    ) public virtual override onlyOwner {
        otherOtcMarkets[targetChain] = ChainInfo(otcMarket, uint256(0), uint256(0));
        emit OtcMarketListed(targetChain, otcMarket);
    }

    function hashOffer(
        address sellerSourceAddress,
        uint16 sourceChain,
        uint16 targetChain,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint128 exchangeRate
    ) public pure virtual override returns (uint256 offerId) {
        return
            uint256(
                keccak256(
                    abi.encode(
                        sellerSourceAddress,
                        sourceChain,
                        targetChain,
                        sourceTokenAddress,
                        targetTokenAddress,
                        exchangeRate
                    )
                )
            );
    }

    function createOffer(
        uint16 targetChain,
        address sellerTargetAddress,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint128 sourceTokenAmount,
        uint128 exchangeRate
    ) public payable virtual override returns (uint256 newOfferId);

    function acceptOffer(
        uint256 offerId,
        uint128 sourceTokenAmount
    ) public payable virtual override;

    function cancelOffer(uint256 offerId, uint256 targetCost) public payable virtual override;

    function quoteCrossChainDelivery(
        uint16 targetChain,
        uint256 receiverValue
    ) public view virtual returns (uint256 cost);

    function _sendWormholeMessage(
        CrossChainMessages messageType,
        bytes memory messagePayload,
        uint16 targetChain,
        uint256 cost,
        uint256 targetCost
    ) internal virtual;

    function _receiveCreateOffer(uint256 offerId, Offer memory offer) internal virtual;

    function _receiveAcceptOffer(
        uint256 offerId,
        address buyer,
        uint128 sourceTokenAmount
    ) internal virtual;

    function _receiveCancelOfferAppeal(uint256 cost, uint256 offerId) internal virtual;

    function _receiveCancelOffer(uint256 offerId) internal virtual;
}
