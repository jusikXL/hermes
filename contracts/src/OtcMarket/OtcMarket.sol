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
    uint256 public tradingFee;

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
        address seller,
        uint16 sourceChain,
        uint16 targetChain,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint256 exchangeRate
    ) public pure virtual override returns (uint256 offerId) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        seller,
                        sourceChain,
                        targetChain,
                        sourceTokenAddress,
                        targetTokenAddress,
                        exchangeRate
                    )
                )
            );
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

    function _sendCreateOfferMessage(uint256 offerId, uint256 cost) private {
        Offer storage offer = offers[offerId];

        bytes memory payload = abi.encode(CrossChainMessages.OfferAccepted, offerId, offer);

        wormholeRelayer.sendPayloadToEvm{value: cost}(
            offer.targetChain,
            _otherOtcMarkets[offer.targetChain],
            payload,
            0,
            GAS_LIMIT
        );
    }

    function createOffer(
        uint16 targetChain,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint256 sourceTokenAmount,
        uint256 exchangeRate
    ) public payable virtual override returns (uint256 newOfferId) {
        uint256 cost = quoteCrossChainDelivery(targetChain);
        _validateOfferParams(targetChain, sourceTokenAmount, exchangeRate, cost);

        address seller = msg.sender;

        newOfferId = hashOffer(
            seller,
            chain,
            targetChain,
            sourceTokenAddress,
            targetTokenAddress,
            exchangeRate
        );
        if (offers[newOfferId].seller != address(0)) {
            revert OfferAlreadyExists(newOfferId);
        }

        offers[newOfferId] = Offer(
            seller,
            chain,
            targetChain,
            sourceTokenAddress,
            targetTokenAddress,
            sourceTokenAmount,
            exchangeRate
        );
        emit OfferCreated(
            newOfferId,
            seller,
            chain,
            targetChain,
            sourceTokenAddress,
            targetTokenAddress,
            sourceTokenAmount,
            exchangeRate
        );

        IERC20(sourceTokenAddress).transferFrom(msg.sender, address(this), sourceTokenAmount);
        _sendCreateOfferMessage(newOfferId, cost);
    }

    function _receiveOffer(uint256 offerId, Offer memory offer) private {
        offers[offerId] = offer;

        emit OfferReceived(offerId);
    }

    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory,
        bytes32 sourceAddress,
        uint16 sourceChain,
        bytes32
    ) public payable virtual override {
        // CrossChainMessages messageType = abi.decode(payload, (CrossChainMessages));
        // address sender = fromWormholeFormat(sourceAddress);

        // if ((_otherOtcMarkets[sourceChain]) != sender) {
        //     revert OnlyOtc(sender);
        // }

        //if (messageType == CrossChainMessages.OfferCreated) {
        (CrossChainMessages messageType, uint256 offerId, Offer memory offer) = abi.decode(
            payload,
            (CrossChainMessages, uint256, Offer)
        );

        if (chain != offer.targetChain) {
            revert InvalidTarget(_otherOtcMarkets[offer.targetChain]);
        }

        _receiveOffer(offerId, offer);
        //}
    }
}
