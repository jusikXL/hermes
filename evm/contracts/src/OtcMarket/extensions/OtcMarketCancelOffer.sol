// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {OtcMarket} from "../OtcMarket.sol";

/**
 * @dev Extension of {OtcMarket} for offer cancelation.
 */
abstract contract OtcMarketCancelOffer is OtcMarket {
    function cancelOffer(uint256 offerId, uint256 targetCost) public payable virtual override {
        Offer storage offer = offers[offerId];
        if (offer.sellerSourceAddress == address(0)) {
            revert NonexistentOffer(offerId);
        }

        uint256 cost = quoteCrossChainDelivery(offer.targetChain, targetCost);
        if (msg.value < cost) {
            revert InsufficientValue(msg.value, cost);
        }
        if (chain != offer.sourceChain) {
            revert InvalidChain(chain);
        }
        if (offer.sellerSourceAddress != msg.sender) {
            revert OnlySeller(msg.sender);
        }

        bytes memory messagePayload = abi.encode(offerId);
        _sendWormholeMessage(
            CrossChainMessages.OfferCancelAppeal,
            messagePayload,
            offers[offerId].targetChain,
            cost,
            targetCost
        );
    }

    function _receiveCancelOfferAppeal(uint256 cost, uint256 offerId) internal virtual override {
        uint16 sourceChain = offers[offerId].sourceChain;

        delete offers[offerId];

        emit OfferCanceled(offerId);

        bytes memory messagePayload = abi.encode(offerId);
        _sendWormholeMessage(
            CrossChainMessages.OfferCanceled,
            messagePayload,
            sourceChain,
            cost,
            0
        );
    }

    function _receiveCancelOffer(uint256 offerId) internal virtual override {
        Offer storage offer = offers[offerId];

        emit OfferCanceled(offerId);

        IERC20(offer.sourceTokenAddress).transfer(
            offer.sellerSourceAddress,
            offer.sourceTokenAmount
        );

        delete offers[offerId];
    }
}
