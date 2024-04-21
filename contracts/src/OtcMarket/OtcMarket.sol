// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "wormhole-solidity-sdk/Utils.sol";
import {IWormholeReceiver} from "wormhole-solidity-sdk/interfaces/IWormholeReceiver.sol";
import {IWormholeRelayer} from "wormhole-solidity-sdk/interfaces/IWormholeRelayer.sol";

import {IOtcMarket} from "./IOtcMarket.sol";

/**
 * @dev See {IOtcMarket}.
 */
abstract contract OtcMarket is IOtcMarket, IWormholeReceiver, Ownable {
    uint256 public constant GAS_LIMIT = 100_000_000;

    uint16 public immutable chain;
    IWormholeRelayer public immutable wormholeRelayer;

    constructor(
        uint16 _chain,
        address _initialOwner,
        address _wormholeRelayer
    ) Ownable(_initialOwner) {
        chain = _chain;
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
    }

    mapping(uint16 chain => ChainInfo) public otherOtcMarkets;
    mapping(uint256 offerId => Offer) public offers;

    function listOtcMarket(uint16 targetChain, address otcMarket) public onlyOwner {
        otherOtcMarkets[targetChain] = ChainInfo(otcMarket, uint256(0), uint256(0));
        emit OtcMarketListed(targetChain, otcMarket);
    }

    function hashOffer(
        address sellerSourceAddress,
        uint16 sourceChain,
        uint16 targetChain,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint256 exchangeRate
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

    //////////// < CREATE ////////////
    function createOffer(
        uint16 targetChain,
        address sellerTargetAddress,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint256 sourceTokenAmount,
        uint256 exchangeRate
    ) public payable virtual override returns (uint256 newOfferId) {
        uint256 cost = quoteCrossChainDelivery(targetChain);
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
        //bytes memory messagePayload = abi.encode(newOfferId);
        _sendWormholeMessage(CrossChainMessages.OfferCreated, messagePayload, targetChain, cost);
    }

    function _validateOfferParams(
        uint16 targetChain,
        uint256 sourceTokenAmount,
        uint256 exchangeRate,
        uint256 cost
    ) internal view virtual {
        if (msg.value < cost) {
            revert InsufficientValue(msg.value, cost);
        }
        if (otherOtcMarkets[targetChain].otcMarket == address(0)) {
            revert InvalidChain(targetChain);
        }
        if (sourceTokenAmount == 0 || exchangeRate == 0) {
            revert InvalidPrice(sourceTokenAmount, exchangeRate);
        }
    }

    function _receiveOffer(uint256 offerId, Offer memory offer) internal virtual {
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
    //////////// CREATE > ////////////

    //////////// < ACCEPT ////////////
    function acceptOffer(uint256 offerId) public payable virtual override {
        Offer storage offer = offers[offerId];

        uint256 cost = quoteCrossChainDelivery(offer.sourceChain);
        if (msg.value < cost) {
            revert InsufficientValue(msg.value, cost);
        }

        if (chain != offer.targetChain) {
            revert InvalidChain(chain);
        }
        if (offer.sellerSourceAddress == address(0)) {
            revert NonexistentOffer(offerId);
        }

        _acceptOffer(cost, offerId);
    }

    function _acceptOffer(uint256 cost, uint256 offerId) internal virtual {
        Offer storage offer = offers[offerId];
        address buyer = msg.sender;

        uint256 amount = offer.sourceTokenAmount * offer.exchangeRate;
        uint256 fee = amount > 100 ether ? amount / 100 : 1 ether;

        uint16 sourceChain = offer.sourceChain;

        IERC20(offer.targetTokenAddress).transferFrom(buyer, address(this), fee);
        IERC20(offer.targetTokenAddress).transferFrom(
            buyer,
            offer.sellerTargetAddress,
            amount - fee
        );
        delete offers[offerId];

        emit OfferAccepted(offerId, buyer);

        bytes memory messagePayload = abi.encode(offerId, buyer);

        _sendWormholeMessage(CrossChainMessages.OfferAccepted, messagePayload, sourceChain, cost);
    }
    //////////// ACCEPT > ////////////

    //////////// < CANCEL ////////////
    function cancelOffer(uint256 offerId, uint256 targetCost) public payable virtual override {
        Offer storage offer = offers[offerId];

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

    function _cancelOffer(uint256 cost, uint256 offerId) internal virtual {
        uint16 sourceChain = offers[offerId].sourceChain;

        delete offers[offerId];

        emit OfferCanceled(offerId);

        bytes memory messagePayload = abi.encode(offerId);
        _sendWormholeMessage(CrossChainMessages.OfferCanceled, messagePayload, sourceChain, cost);
    }
    //////////// CANCEL > ////////////

    function _closeOffer(uint256 offerId, address account) internal virtual {
        IERC20(offers[offerId].sourceTokenAddress).transfer(
            account,
            offers[offerId].sourceTokenAmount
        );

        delete offers[offerId];
    }

    ////////////// < WORMHOLE ////////////
    function quoteCrossChainDelivery(
        uint16 targetChain,
        uint256 receiverValue
    ) public view virtual returns (uint256 cost) {
        (cost, ) = wormholeRelayer.quoteEVMDeliveryPrice(targetChain, receiverValue, GAS_LIMIT);
    }

    function quoteCrossChainDelivery(
        uint16 targetChain
    ) public view virtual returns (uint256 cost) {
        return quoteCrossChainDelivery(targetChain, 0);
    }

    function _sendWormholeMessage(
        CrossChainMessages messageType,
        bytes memory messagePayload,
        uint16 targetChain,
        uint256 cost,
        uint256 targetCost
    ) internal virtual {
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

    function _sendWormholeMessage(
        CrossChainMessages messageType,
        bytes memory messagePayload,
        uint16 targetChain,
        uint256 cost
    ) internal virtual {
        _sendWormholeMessage(messageType, messagePayload, targetChain, cost, 0);
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

            _receiveOffer(offerId, offer);
        } else if (messageType == CrossChainMessages.OfferAccepted) {
            (uint256 offerId, address buyer) = abi.decode(payload, (uint256, address));

            if (chain != offers[offerId].sourceChain) {
                revert InvalidChain(chain);
            }

            emit OfferAccepted(offerId, buyer);
            _closeOffer(offerId, buyer);
        } else if (messageType == CrossChainMessages.OfferCancelAppeal) {
            uint256 offerId = abi.decode(payload, (uint256));

            uint256 cost = quoteCrossChainDelivery(offers[offerId].sourceChain);
            if (msg.value < cost) {
                revert InsufficientValue(msg.value, cost);
            }
            if (chain != offers[offerId].targetChain) {
                revert InvalidChain(chain);
            }

            _cancelOffer(cost, offerId);
        } else if (messageType == CrossChainMessages.OfferCanceled) {
            uint256 offerId = abi.decode(payload, (uint256));

            if (chain != offers[offerId].sourceChain) {
                revert InvalidChain(chain);
            }

            emit OfferCanceled(offerId);
            _closeOffer(offerId, offers[offerId].sellerSourceAddress);
        } else {
            revert UnsupportedMessage();
        }
    }
    ////////////// WORMHOLE > ////////////
}
