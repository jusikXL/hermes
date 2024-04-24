// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "wormhole-solidity-sdk/Utils.sol";
import {IWormholeReceiver} from "wormhole-solidity-sdk/interfaces/IWormholeReceiver.sol";
import {IWormholeRelayer} from "wormhole-solidity-sdk/interfaces/IWormholeRelayer.sol";

import {OtcMarket} from "../OtcMarket.sol";

/**
 * @dev Extension of {OtcMarket} for cross chain messaging.
 */
abstract contract OtcMarketMessenger is OtcMarket, IWormholeReceiver {
    uint256 public constant GAS_LIMIT = 200_000;
    IWormholeRelayer public immutable wormholeRelayer;

    constructor(address _wormholeRelayer) {
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
    }

    function quoteCrossChainDelivery(
        uint16 targetChain,
        uint256 receiverValue
    ) public view virtual override returns (uint256 cost) {
        (cost, ) = wormholeRelayer.quoteEVMDeliveryPrice(targetChain, receiverValue, GAS_LIMIT);
    }

    function _sendWormholeMessage(
        CrossChainMessages messageType,
        bytes memory messagePayload,
        uint16 targetChain,
        uint256 cost,
        uint256 targetCost
    ) internal virtual override {
        bytes memory payload = abi.encode(
            otherOtcMarkets[targetChain].lastEmittedMessage,
            messageType,
            messagePayload
        );

        otherOtcMarkets[targetChain].lastEmittedMessage = uint256(keccak256(payload));

        wormholeRelayer.sendPayloadToEvm{value: cost}(
            targetChain,
            otherOtcMarkets[targetChain].otcMarket,
            payload,
            targetCost,
            GAS_LIMIT
        );
    }

    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory,
        bytes32 sourceAddress,
        uint16 sourceChain,
        bytes32
    ) public payable virtual override {
        if (msg.sender != address(wormholeRelayer)) {
            revert OnlyWormholeRelayer(msg.sender);
        }

        address sender = fromWormholeFormat(sourceAddress);
        if ((otherOtcMarkets[sourceChain].otcMarket) != sender) {
            revert OnlyOtc(sender);
        }

        uint256 lastReceivedMessage = otherOtcMarkets[sourceChain].lastReceivedMessage;
        (
            uint256 recentReceivedMessage,
            CrossChainMessages messageType,
            bytes memory messagePayload
        ) = abi.decode(payload, (uint256, CrossChainMessages, bytes));
        if (lastReceivedMessage != recentReceivedMessage) {
            revert InvalidMessageOrder(recentReceivedMessage);
        }
        otherOtcMarkets[sourceChain].lastReceivedMessage = uint256(keccak256(payload));

        _receiveWormholeMessages(messageType, messagePayload);
    }

    function _receiveWormholeMessages(
        CrossChainMessages messageType,
        bytes memory payload
    ) internal virtual {
        if (messageType == CrossChainMessages.OfferCreated) {
            (uint256 offerId, Offer memory offer) = abi.decode(payload, (uint256, Offer));

            if (chain != offer.targetChain) {
                revert InvalidChain(chain);
            }

            _receiveCreateOffer(offerId, offer);
        } else if (messageType == CrossChainMessages.OfferAccepted) {
            (uint256 offerId, address buyer, uint256 sourceTokenAmount) = abi.decode(
                payload,
                (uint256, address, uint256)
            );

            if (chain != offers[offerId].sourceChain) {
                revert InvalidChain(chain);
            }

            _receiveAcceptOffer(offerId, buyer, sourceTokenAmount);
        } else if (messageType == CrossChainMessages.OfferCancelAppeal) {
            uint256 offerId = abi.decode(payload, (uint256));

            if (chain != offers[offerId].targetChain) {
                revert InvalidChain(chain);
            }

            uint256 cost = quoteCrossChainDelivery(offers[offerId].sourceChain, 0);
            if (msg.value >= cost) {
                _receiveCancelOfferAppeal(cost, offerId);
            }
        } else if (messageType == CrossChainMessages.OfferCanceled) {
            uint256 offerId = abi.decode(payload, (uint256));

            if (chain != offers[offerId].sourceChain) {
                revert InvalidChain(chain);
            }

            _receiveCancelOffer(offerId);
        } else {
            revert UnsupportedMessage();
        }
    }
}
