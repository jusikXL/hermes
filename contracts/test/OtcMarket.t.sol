// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MyOtcMarket} from "../src/OtcMarket/MyOtcMarket.sol";
import {OtcMarket} from "../src/OtcMarket/OtcMarket.sol";
import {IOtcMarket} from "../src/OtcMarket/IOtcMarket.sol";
import {console} from "forge-std/Test.sol";
import {MyToken} from "../src/MyToken.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {WormholeRelayerTrippleTest} from "./WormholeRelayerTrippleTest.sol";
import "wormhole-solidity-sdk/Utils.sol";
import "forge-std/Test.sol";

contract TestOtcMarket is MyOtcMarket {
    address trustedRelayer;

    constructor(
        uint16 chain,
        address initialOwner,
        address wormholeRelayer
    ) MyOtcMarket(chain, initialOwner, wormholeRelayer) {
        trustedRelayer = initialOwner;
    }

    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory,
        bytes32 sourceAddress,
        uint16 sourceChain,
        bytes32
    ) public payable override {
        address account = msg.sender;
        if (account != address(wormholeRelayer) && account != trustedRelayer) {
            revert OnlyWormholeRelayer(account);
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

contract OtcMarketTest is WormholeRelayerTrippleTest, IERC20Errors {
    OtcMarket public firstOtcMarket;
    OtcMarket public secondOtcMarket;
    OtcMarket public thirdOtcMarket;

    MyToken public firstToken;
    MyToken public secondToken;
    MyToken public thirdToken;

    uint256 public constant EXCHANGE_RATE = 2;
    uint256 public constant AMOUNT = 1e18;

    constructor() WormholeRelayerTrippleTest([uint16(14), uint16(4), uint16(6)]) {}

    function setUpFirst() public override {
        firstOtcMarket = new TestOtcMarket(firstChain, address(this), address(firstRelayer));
        firstToken = new MyToken(address(this));
        firstToken.mint(address(this), 100e18);
    }

    function setUpSecond() public override {
        secondOtcMarket = new TestOtcMarket(secondChain, address(this), address(secondRelayer));
        secondToken = new MyToken(address(this));
        secondToken.mint(address(this), 100e18);
    }

    function setUpThird() public override {
        thirdOtcMarket = new TestOtcMarket(thirdChain, address(this), address(thirdRelayer));
        thirdToken = new MyToken(address(this));
        thirdToken.mint(address(this), 100e18);
    }

    function setUpGeneral() public override {
        firstOtcMarket.listOtcMarket(secondChain, address(secondOtcMarket));

        vm.selectFork(secondFork);
        secondOtcMarket.listOtcMarket(firstChain, address(firstOtcMarket));
        secondOtcMarket.listOtcMarket(thirdChain, address(thirdOtcMarket));

        vm.selectFork(thirdFork);
        thirdOtcMarket.listOtcMarket(secondChain, address(secondOtcMarket));
    }

    function testCreateOffer() public {
        vm.selectFork(0);
        firstToken.approve(address(firstOtcMarket), AMOUNT);
        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(secondChain);

        uint256 offerId = firstOtcMarket.hashOffer(
            address(this),
            firstChain,
            secondChain,
            address(firstToken),
            address(secondToken),
            EXCHANGE_RATE
        );

        vm.recordLogs();
        vm.expectEmit(true, true, true, true, address(firstOtcMarket));
        emit IOtcMarket.OfferCreated(
            offerId,
            address(this),
            address(this),
            firstChain,
            secondChain,
            address(firstToken),
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );
        firstOtcMarket.createOffer{value: cost}(
            secondChain,
            address(this),
            address(firstToken),
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );

        vm.selectFork(secondFork);
        vm.expectEmit(true, true, true, true, address(secondOtcMarket));
        emit IOtcMarket.OfferCreated(
            offerId,
            address(this),
            address(this),
            firstChain,
            secondChain,
            address(firstToken),
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );

        vm.selectFork(firstFork);
        performDelivery();

        vm.selectFork(secondFork);
        (
            address mca,
            address mta,
            uint16 sc,
            uint16 tc,
            address sta,
            address tta,
            uint256 a,
            uint256 er
        ) = secondOtcMarket.offers(offerId);

        assertEq(mca, address(this));
        assertEq(mta, address(this));
        assertEq(sc, firstChain);
        assertEq(tc, secondChain);
        assertEq(sta, address(firstToken));
        assertEq(tta, address(secondToken));
        assertEq(a, AMOUNT);
        assertEq(er, EXCHANGE_RATE);
    }

    function testCreateOffer_InsufficientAllowance() public {
        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(secondChain);

        vm.expectRevert(
            abi.encodeWithSelector(
                ERC20InsufficientAllowance.selector,
                address(firstOtcMarket),
                0,
                AMOUNT
            )
        );
        firstOtcMarket.createOffer{value: cost}(
            secondChain,
            address(this),
            address(firstToken),
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );
    }

    function testCreateOffer_InvalidPrice() public {
        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(secondChain);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InvalidPrice.selector, 0, EXCHANGE_RATE));
        firstOtcMarket.createOffer{value: cost}(
            secondChain,
            address(this),
            address(firstToken),
            address(secondToken),
            0,
            EXCHANGE_RATE
        );

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InvalidPrice.selector, AMOUNT, 0));
        firstOtcMarket.createOffer{value: cost}(
            secondChain,
            address(this),
            address(firstToken),
            address(secondToken),
            AMOUNT,
            0
        );

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InvalidPrice.selector, 0, 0));
        firstOtcMarket.createOffer{value: cost}(
            secondChain,
            address(this),
            address(firstToken),
            address(secondToken),
            0,
            0
        );
    }

    function testCreateOffer_InvalidChain() public {
        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(thirdChain);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InvalidChain.selector, thirdChain));
        firstOtcMarket.createOffer{value: cost}(
            thirdChain,
            address(this),
            address(firstToken),
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );
    }

    function testCreateOffer_InsufficientValue() public {
        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(secondChain);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InsufficientValue.selector, 0, cost));
        firstOtcMarket.createOffer{value: 0}(
            secondChain,
            address(this),
            address(firstToken),
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );
    }

    function _createOffer(
        OtcMarket sourceOtcMarket,
        uint16 targetChain,
        MyToken sourceToken,
        address targetToken
    ) private {
        uint256 cost = sourceOtcMarket.quoteCrossChainDelivery(targetChain);
        sourceToken.approve(address(sourceOtcMarket), AMOUNT);
        sourceOtcMarket.createOffer{value: cost}(
            targetChain,
            address(this),
            address(sourceToken),
            address(targetToken),
            AMOUNT,
            EXCHANGE_RATE
        );
    }

    function testCreateOffer_OfferAlreadyExists() public {
        _createOffer(firstOtcMarket, secondChain, firstToken, address(secondToken));

        uint256 offerId = firstOtcMarket.hashOffer(
            address(this),
            firstChain,
            secondChain,
            address(firstToken),
            address(secondToken),
            EXCHANGE_RATE
        );
        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(secondChain);
        firstToken.approve(address(firstOtcMarket), AMOUNT);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.OfferAlreadyExists.selector, offerId));
        firstOtcMarket.createOffer{value: cost}(
            secondChain,
            address(this),
            address(firstToken),
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );
    }

    function testCreateOffer_OnlyWormholeRelayer() public {
        uint256 offerId = firstOtcMarket.hashOffer(
            address(this),
            secondChain,
            firstChain,
            address(secondToken),
            address(firstToken),
            EXCHANGE_RATE
        );
        IOtcMarket.Offer memory offer = IOtcMarket.Offer(
            address(this),
            address(this),
            secondChain,
            firstChain,
            address(secondToken),
            address(firstToken),
            AMOUNT,
            EXCHANGE_RATE
        );

        bytes memory payload = abi.encode(
            IOtcMarket.CrossChainMessages.OfferCreated,
            abi.encode(offerId, offer)
        );

        address fakeRelayer = 0xC37713ef41Aff1A7ac1c3D02f6f0B3a57F8A3091;
        vm.expectRevert(
            abi.encodeWithSelector(IOtcMarket.OnlyWormholeRelayer.selector, fakeRelayer)
        );
        vm.prank(fakeRelayer);
        firstOtcMarket.receiveWormholeMessages(
            payload,
            new bytes[](0),
            toWormholeFormat(address(secondOtcMarket)),
            secondChain,
            bytes32(0)
        );
    }

    function testCreateOffer_OnlyOtc() public {
        vm.selectFork(thirdFork);
        thirdOtcMarket.listOtcMarket(firstChain, address(firstOtcMarket));

        vm.recordLogs();
        _createOffer(thirdOtcMarket, firstChain, thirdToken, address(firstToken));
        performDelivery();

        vm.selectFork(firstFork);
        uint256 offerId = firstOtcMarket.hashOffer(
            address(this),
            thirdChain,
            firstChain,
            address(thirdToken),
            address(firstToken),
            EXCHANGE_RATE
        );
        (address mca, , , , , , , ) = firstOtcMarket.offers(offerId);

        assertEq(mca, address(0));
    }

    function testCancelOffer() public {
        vm.recordLogs();
        address seller = address(this);

        _createOffer(firstOtcMarket, secondChain, firstToken, address(secondToken));
        performDelivery();

        uint256 offerId = firstOtcMarket.hashOffer(
            seller,
            firstChain,
            secondChain,
            address(firstToken),
            address(secondToken),
            EXCHANGE_RATE
        );

        vm.selectFork(secondFork);
        uint256 targetCost = secondOtcMarket.quoteCrossChainDelivery(firstChain);
        vm.selectFork(firstFork);
        uint256 sourceCost = firstOtcMarket.quoteCrossChainDelivery(secondChain, targetCost);

        // source: cancel offer appeal
        firstOtcMarket.cancelOffer{value: sourceCost}(offerId, targetCost);

        // expect emit on target
        vm.selectFork(secondFork);
        vm.expectEmit(true, false, false, false, address(secondOtcMarket));
        emit IOtcMarket.OfferCanceled(offerId);

        vm.selectFork(firstFork);
        performDelivery();

        // expect emit on source
        vm.selectFork(firstFork);
        vm.expectEmit(true, false, false, false, address(firstOtcMarket));
        emit IOtcMarket.OfferCanceled(offerId);

        vm.selectFork(secondFork);
        performDelivery();

        // check that offer was deleted on both chains
        (seller, , , , , , , ) = secondOtcMarket.offers(offerId);
        assertEq(seller, address(0));

        vm.selectFork(firstFork);
        (seller, , , , , , , ) = firstOtcMarket.offers(offerId);
        assertEq(seller, address(0));
    }
}
