// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {OtcMarket} from "../OtcMarket.sol";

/**
 * @dev Extension of {OtcMarket} for offer creation.
 */
abstract contract OtcMarketCreateOffer is OtcMarket {
    function createOffer(
        uint16 targetChain,
        address sellerTargetAddress,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint128 sourceTokenAmount,
        uint128 exchangeRate
    ) public payable virtual override returns (uint256 newOfferId) {
        uint256 cost = quoteCrossChainDelivery(targetChain, 0);
        _validateOfferParams(targetChain, sourceTokenAmount, exchangeRate, cost);

        address sellerSourceAddress = msg.sender;

        newOfferId = hashOffer(
            sellerSourceAddress,
            chain,
            targetChain,
            sourceTokenAddress,
            targetTokenAddress,
            exchangeRate
        );
        if (offers[newOfferId].sellerSourceAddress != address(0)) {
            revert OfferAlreadyExists(newOfferId);
        }

        offers[newOfferId] = Offer(
            sellerSourceAddress,
            sellerTargetAddress,
            chain,
            targetChain,
            sourceTokenAddress,
            targetTokenAddress,
            sourceTokenAmount,
            exchangeRate
        );
        emit OfferCreated(
            newOfferId,
            sellerSourceAddress,
            sellerTargetAddress,
            chain,
            targetChain,
            sourceTokenAddress,
            targetTokenAddress,
            sourceTokenAmount,
            exchangeRate
        );

        IERC20(sourceTokenAddress).transferFrom(
            sellerSourceAddress,
            address(this),
            sourceTokenAmount
        );

        bytes memory messagePayload = abi.encode(newOfferId, offers[newOfferId]);
        _sendWormholeMessage(CrossChainMessages.OfferCreated, messagePayload, targetChain, cost, 0);
    }

    function _validateOfferParams(
        uint16 targetChain,
        uint128 sourceTokenAmount,
        uint128 exchangeRate,
        uint256 cost
    ) internal view virtual {
        if (msg.value < cost) {
            revert InsufficientValue(msg.value, cost);
        }
        if (otherOtcMarkets[targetChain].otcMarket == address(0)) {
            revert InvalidChain(targetChain);
        }
        if (sourceTokenAmount < MINIMUM_AMOUNT) {
            revert InsufficientAmount(sourceTokenAmount);
        }
        if (exchangeRate < MINIMUM_EXCHANGE_RATE) {
            revert InsufficientExchangeRate(exchangeRate);
        }
    }

    function _receiveCreateOffer(uint256 offerId, Offer memory offer) internal virtual override {
        offers[offerId] = offer;

        emit OfferCreated(
            offerId,
            offer.sellerSourceAddress,
            offer.sellerTargetAddress,
            offer.sourceChain,
            offer.targetChain,
            offer.sourceTokenAddress,
            offer.targetTokenAddress,
            offer.sourceTokenAmount,
            offer.exchangeRate
        );
    }
}
