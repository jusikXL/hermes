// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "wormhole-solidity-sdk/Utils.sol";
import {IWormholeReceiver} from "wormhole-solidity-sdk/interfaces/IWormholeReceiver.sol";
import {IWormholeRelayer} from "wormhole-solidity-sdk/interfaces/IWormholeRelayer.sol";

import {IOtcMarket} from "./IOtcMarket.sol";

contract OtcMarket is IOtcMarket, IWormholeReceiver, Ownable {
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

    mapping(uint16 chain => address otcMarket) private _otherOtcMarkets;
    mapping(uint256 offerId => Offer) public offers;

    function listOtcMarket(uint16 targetChain, address otcMarket) public onlyOwner {
        _otherOtcMarkets[targetChain] = otcMarket;
    }

    function quoteCrossChainDelivery(uint16 targetChain) public view returns (uint256 cost) {
        (cost, ) = wormholeRelayer.quoteEVMDeliveryPrice(targetChain, 0, GAS_LIMIT);
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
    ) private view {
        if (sourceTokenAmount == 0 || exchangeRate == 0) {
            revert InvalidPrice(sourceTokenAmount, exchangeRate);
        }
        if (_otherOtcMarkets[targetChain] == address(0)) {
            revert UnsupportedChain(targetChain);
        }
        if (msg.value < cost) {
            revert InsufficientValue(msg.value, cost);
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
                revert InvalidTarget(_otherOtcMarkets[offer.targetChain]);
            }

            _receiveOffer(offerId, offer);
        } else if (messageType == CrossChainMessages.OfferAccepted) {
            (uint256 offerId, address buyer) = abi.decode(messagePayload, (uint256, address));

            uint16 offerSourceChain = offers[offerId].sourceChain;
            if (chain != offerSourceChain) {
                revert InvalidTarget(_otherOtcMarkets[offerSourceChain]);
            }

            _closeOffer(offerId, buyer);
        } else {
            revert InvalidMessage();
        }
    }

    function _closeOffer(uint256 offerId, address buyer) private {
        IERC20(offers[offerId].sourceTokenAddress).transfer(
            buyer,
            offers[offerId].sourceTokenAmount
        );

        delete offers[offerId];

        emit OfferClosed(offerId);
    }

    function _receiveOffer(uint256 offerId, Offer memory offer) private {
        offers[offerId] = offer;

        emit OfferReceived(offerId);
    }

    function acceptOffer(uint256 offerId) public payable virtual override {
        Offer storage offer = offers[offerId];

        if (offer.sellerSourceAddress == address(0)) {
            revert NonexistentOffer(offerId);
        }

        if (chain != offer.targetChain) {
            revert InvalidTarget(_otherOtcMarkets[offer.targetChain]);
        }

        uint256 cost = quoteCrossChainDelivery(offer.sourceChain);
        if (msg.value < cost) {
            revert InsufficientValue(msg.value, cost);
        }

        _acceptOffer(cost, offerId);
    }

    function _acceptOffer(uint256 cost, uint256 offerId) private {
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
}
