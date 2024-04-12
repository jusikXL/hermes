// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "wormhole-solidity-sdk/Utils.sol";
import {IWormholeReceiver} from "wormhole-solidity-sdk/interfaces/IWormholeReceiver.sol";
import {IWormholeRelayer} from "wormhole-solidity-sdk/interfaces/IWormholeRelayer.sol";

import {IOtcMarket} from "./IOtcMarket.sol";

abstract contract OtcMarket is IOtcMarket, IWormholeReceiver, Ownable {
    uint256 private constant GAS_LIMIT = 50_000;
    uint16 public immutable chain;

    IWormholeRelayer public immutable wormholeRelayer;

    uint256 public tradingFee;

    constructor(uint16 _chain, address _initialOwner, address _wormholeRelayer) Ownable(_initialOwner) {
        chain = _chain;
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
    }

    mapping(uint16 chain => address otcMarket) private _otherOtcMarkets;
    mapping(uint256 offerId => Offer) public offers;

    function quoteCrossChainDelivery(uint16 targetChain) public view returns (uint256 cost) {
        (cost, ) = wormholeRelayer.quoteEVMDeliveryPrice(targetChain, 0, GAS_LIMIT);
    }

    function hashOffer(
        address seller,
        //
        uint16 sourceChain,
        uint16 targetChain,
        //
        address sourceTokenAddress,
        address targetTokenAddress,
        //
        uint256 exchangeRate
    ) public pure returns (uint256 offerId) {
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
            revert InvalidAmount();
        }
        if (_otherOtcMarkets[targetChain] == address(0)) {
            revert UnsupportedChain(targetChain);
        }
        if (msg.value < cost) {
            revert SomeError();
        }
    }

    function createOffer(
        uint16 targetChain,
        //
        address sourceTokenAddress,
        address targetTokenAddress,
        //
        uint256 sourceTokenAmount,
        uint256 exchangeRate // price per one source token
    ) public payable returns (uint256 newOfferId) {
        uint256 cost = quoteCrossChainDelivery(targetChain);
        _validateOfferParams(targetChain, sourceTokenAmount, exchangeRate, cost);

        address seller = msg.sender;

        newOfferId = hashOffer(seller, chain, targetChain, sourceTokenAddress, targetTokenAddress, exchangeRate);
        if (offers[newOfferId].seller != address(0)) {
            revert OfferAlreadyExists(newOfferId);
        }

        offers[newOfferId] = Offer(
            seller,
            //
            chain,
            targetChain,
            //
            sourceTokenAddress,
            targetTokenAddress,
            //
            sourceTokenAmount,
            exchangeRate
        );
        emit OfferCreated(
            newOfferId,
            //
            seller,
            //
            chain,
            targetChain,
            //
            sourceTokenAddress,
            targetTokenAddress,
            //
            sourceTokenAmount,
            exchangeRate
        );

        IERC20(sourceTokenAddress).transferFrom(msg.sender, address(this), sourceTokenAmount);

        _sendOfferAcceptedMessage(newOfferId, cost);
    }

    function _sendOfferAcceptedMessage(uint256 offerId, uint256 cost) private {
        Offer storage offer = offers[offerId];

        bytes memory payload = abi.encode(offerId, offer);

        wormholeRelayer.sendPayloadToEvm{value: cost}(
            offer.targetChain,
            _otherOtcMarkets[offer.targetChain],
            payload,
            0,
            GAS_LIMIT
        );
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
    ) public payable override {
        (uint256 offerId, Offer memory offer) = abi.decode(payload, (uint256, Offer));

        if ((_otherOtcMarkets[sourceChain]) != fromWormholeFormat(sourceAddress)) {
            revert SomeError(); // offer was sent not by our otc
        }
        if (chain != offer.targetChain) {
            revert SomeError(); // offer was sent to a different chain/otc
        }
        //require(msg.sender == address(wormholeRelayer), "Only relayer allowed");
        _receiveOffer(offerId, offer);
    }

    // modifier offerExists(uint256 offerId) {
    //     if (offers[offerId].seller == address(0)) {
    //         revert OfferNotFound(offerId);
    //     }
    //     _;
    // }

    // function cancelOffer(
    //     uint256 offerId
    // ) external offerExists(offerId) {
    //     address operator = msg.sender;
    //     address seller = offers[offerId].seller;

    //     if (seller != operator) {
    //         revert UnauthorizedOfferCancellation(operator, seller);
    //     }

    //     royaltyToken.transfer(seller, offers[offerId].sourceAmount);

    //     delete offers[offerId];
    //     emit OfferCancelled(offerId);
    // }

    // function acceptOffer(
    //     uint256 offerId
    // ) external offerExists(offerId) {
    //     address buyer = msg.sender;
    //     address seller = offers[offerId].seller;

    //     uint256 targetAmount = offers[offerId].targetAmount;
    //     uint256 fee = targetAmount > 100 ether ? targetAmount / 100 : 1 ether;
    //     uint256 targetAmountLessFee = targetAmount - fee;
    //     uint256 sourceAmount = offers[offerId].sourceAmount;

    //     tradingFeeRevenue += fee;

    //     delete offers[offerId];
    //     emit OfferAccepted(offerId, buyer);

    //     royaltyToken.transfer(buyer, sourceAmount);
    //     stablecoin.transferFrom(buyer, address(this), fee);
    //     stablecoin.transferFrom(buyer, seller, targetAmountLessFee);
    // }
}
