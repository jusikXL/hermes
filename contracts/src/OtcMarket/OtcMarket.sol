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

    mapping(uint16 chain => address otcMarket) internal _otherOtcMarkets;
    mapping(uint256 offerId => Offer) public offers;

    function listOtcMarket(uint16 targetChain, address otcMarket) public onlyOwner {
        _otherOtcMarkets[targetChain] = otcMarket;
    }

    function quoteCrossChainDelivery(
        uint16 targetChain,
        uint256 receiverValue
    ) public view returns (uint256 cost) {
        (cost, ) = wormholeRelayer.quoteEVMDeliveryPrice(targetChain, receiverValue, GAS_LIMIT);
    }

    function quoteCrossChainDelivery(uint16 targetChain) public view returns (uint256 cost) {
        return quoteCrossChainDelivery(targetChain, 0);
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

        IERC20(sourceTokenAddress).transferFrom(msg.sender, address(this), sourceTokenAmount);
        _sendCreateOfferMessage(cost, newOfferId);
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
        if (_otherOtcMarkets[targetChain] == address(0)) {
            revert InvalidChain(targetChain);
        }
        if (sourceTokenAmount == 0 || exchangeRate == 0) {
            revert InvalidPrice(sourceTokenAmount, exchangeRate);
        }
    }

    function _sendCreateOfferMessage(uint256 cost, uint256 offerId) private {
        Offer storage offer = offers[offerId];

        bytes memory payload = abi.encode(
            CrossChainMessages.OfferCreated,
            abi.encode(offerId, offer)
        );

        wormholeRelayer.sendPayloadToEvm{value: cost}(
            offer.targetChain,
            _otherOtcMarkets[offer.targetChain],
            payload,
            0,
            GAS_LIMIT
        );
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
            revert InvalidChain(offer.targetChain);
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
        _sendAcceptOfferMessage(cost, offerId, sourceChain, buyer);
    }

    function _sendAcceptOfferMessage(
        uint256 cost,
        uint256 offerId,
        uint16 sourceChain,
        address buyer
    ) private {
        bytes memory payload = abi.encode(
            CrossChainMessages.OfferAccepted,
            abi.encode(offerId, buyer)
        );

        wormholeRelayer.sendPayloadToEvm{value: cost}(
            sourceChain,
            _otherOtcMarkets[sourceChain],
            payload,
            0,
            GAS_LIMIT
        );
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
            revert InvalidChain(offer.sourceChain);
        }
        if (offer.sellerSourceAddress != msg.sender) {
            revert OnlySeller(msg.sender);
        }

        _sendCancelOfferAppealMessage(cost, targetCost, offerId);
    }

    function _sendCancelOfferAppealMessage(
        uint256 cost,
        uint256 targetCost,
        uint256 offerId
    ) private {
        uint16 targetChain = offers[offerId].targetChain;

        bytes memory payload = abi.encode(
            CrossChainMessages.OfferCancelAppeal,
            abi.encode(offerId)
        );

        wormholeRelayer.sendPayloadToEvm{value: cost}(
            targetChain,
            _otherOtcMarkets[targetChain],
            payload,
            targetCost,
            GAS_LIMIT
        );
    }

    function _cancelOffer(uint256 cost, uint256 offerId) internal virtual {
        uint16 sourceChain = offers[offerId].sourceChain;

        delete offers[offerId];

        emit OfferCanceled(offerId);
        _sendCancelOfferMessage(cost, offerId, sourceChain);
    }

    function _sendCancelOfferMessage(uint256 cost, uint256 offerId, uint16 sourceChain) private {
        bytes memory payload = abi.encode(CrossChainMessages.OfferCanceled, abi.encode(offerId));

        wormholeRelayer.sendPayloadToEvm{value: cost}(
            sourceChain,
            _otherOtcMarkets[sourceChain],
            payload,
            0,
            GAS_LIMIT
        );
    }
    //////////// CANCEL > ////////////

    function _closeOffer(uint256 offerId, address account) internal virtual {
        IERC20(offers[offerId].sourceTokenAddress).transfer(
            account,
            offers[offerId].sourceTokenAmount
        );

        delete offers[offerId];
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

        (CrossChainMessages messageType, bytes memory messagePayload) = abi.decode(
            payload,
            (CrossChainMessages, bytes)
        );

        address sender = fromWormholeFormat(sourceAddress);
        if ((_otherOtcMarkets[sourceChain]) != sender) {
            revert OnlyOtc(sender);
        }

        if (messageType == CrossChainMessages.OfferCreated) {
            (uint256 offerId, Offer memory offer) = abi.decode(messagePayload, (uint256, Offer));

            if (chain != offer.targetChain) {
                revert InvalidChain(offer.targetChain);
            }

            _receiveOffer(offerId, offer);
        } else if (messageType == CrossChainMessages.OfferAccepted) {
            (uint256 offerId, address buyer) = abi.decode(messagePayload, (uint256, address));

            uint16 offerSourceChain = offers[offerId].sourceChain;
            if (chain != offerSourceChain) {
                revert InvalidChain(offerSourceChain);
            }

            emit OfferAccepted(offerId, buyer);
            _closeOffer(offerId, buyer);
        } else if (messageType == CrossChainMessages.OfferCancelAppeal) {
            uint256 offerId = abi.decode(messagePayload, (uint256));
            uint16 offerTargetChain = offers[offerId].targetChain;

            uint256 cost = quoteCrossChainDelivery(offers[offerId].sourceChain);
            if (msg.value < cost) {
                revert InsufficientValue(msg.value, cost);
            }
            if (chain != offerTargetChain) {
                revert InvalidChain(offerTargetChain);
            }

            _cancelOffer(cost, offerId);
        } else if (messageType == CrossChainMessages.OfferCanceled) {
            uint256 offerId = abi.decode(messagePayload, (uint256));

            if (chain != offers[offerId].sourceChain) {
                revert InvalidChain(offers[offerId].targetChain);
            }

            emit OfferCanceled(offerId);
            _closeOffer(offerId, offers[offerId].sellerSourceAddress);
        } else {
            revert UnsupportedMessage();
        }
    }
}
