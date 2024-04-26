// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {OtcMarket} from "../OtcMarket.sol";

import "forge-std/Test.sol";

/**
 * @dev Extension of {OtcMarket} for offer acceptance.
 */
abstract contract OtcMarketAcceptOffer is OtcMarket {
    function acceptOffer(
        uint256 offerId,
        uint128 sourceTokenAmount
    ) public payable virtual override {
        Offer storage offer = offers[offerId];
        if (offer.sellerSourceAddress == address(0)) {
            revert NonexistentOffer(offerId);
        }
        uint256 cost = quoteCrossChainDelivery(offer.sourceChain, 0);
        if (msg.value < cost) {
            revert InsufficientValue(msg.value, cost);
        }
        if (chain != offer.targetChain) {
            revert InvalidChain(chain);
        }
        if (sourceTokenAmount < MINIMUM_AMOUNT) {
            revert InsufficientAmount(sourceTokenAmount);
        }
        if (offer.sourceTokenAmount < sourceTokenAmount) {
            revert ExcessiveAmount(sourceTokenAmount, offer.sourceTokenAmount);
        }

        _acceptOffer(cost, offerId, sourceTokenAmount);
    }

    function _acceptOffer(
        uint256 cost,
        uint256 offerId,
        uint128 sourceTokenAmount
    ) internal virtual {
        Offer storage offer = offers[offerId];
        address buyer = msg.sender;

        uint256 targetTokenAmount = (uint256(sourceTokenAmount) * uint256(offer.exchangeRate)) /
            1 ether;
        uint256 fee = targetTokenAmount / 100; // 1%

        offer.sourceTokenAmount -= sourceTokenAmount;
        emit OfferAccepted(offerId, buyer, sourceTokenAmount);

        IERC20(offer.targetTokenAddress).transferFrom(buyer, address(this), fee);
        IERC20(offer.targetTokenAddress).transferFrom(
            buyer,
            offer.sellerTargetAddress,
            targetTokenAmount - fee
        );

        bytes memory messagePayload = abi.encode(offerId, buyer, sourceTokenAmount);
        _sendWormholeMessage(
            CrossChainMessages.OfferAccepted,
            messagePayload,
            offer.sourceChain,
            cost,
            0
        );
    }

    function _receiveAcceptOffer(
        uint256 offerId,
        address buyer,
        uint128 sourceTokenAmount
    ) internal virtual override {
        Offer storage offer = offers[offerId];

        offer.sourceTokenAmount -= sourceTokenAmount;
        emit OfferAccepted(offerId, buyer, sourceTokenAmount);

        IERC20(offer.sourceTokenAddress).transfer(buyer, sourceTokenAmount);
    }
}
