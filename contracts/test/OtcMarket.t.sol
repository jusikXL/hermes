// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OtcMarket} from "../src/OtcMarket/OtcMarket.sol";
import {IOtcMarket} from "../src/OtcMarket/IOtcMarket.sol";
import {console} from "forge-std/Test.sol";
import {MyToken} from "../src/MyToken.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {WormholeRelayerTrippleTest} from "./WormholeRelayerTrippleTest.sol";
import "wormhole-solidity-sdk/Utils.sol";
import "forge-std/Test.sol";

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
        firstOtcMarket = new OtcMarket(firstChain, address(this), address(firstRelayer));
        firstToken = new MyToken(address(this));
        firstToken.mint(address(this), 100e18);
    }

    function setUpSecond() public override {
        secondOtcMarket = new OtcMarket(secondChain, address(this), address(secondRelayer));
        secondToken = new MyToken(address(this));
        secondToken.mint(address(this), 100e18);
    }

    function setUpThird() public override {
        thirdOtcMarket = new OtcMarket(thirdChain, address(this), address(thirdRelayer));
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
        vm.expectEmit(true, false, false, false, address(secondOtcMarket));
        emit IOtcMarket.OfferReceived(offerId);

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

    function testCreateOffer_UnsupportedChain() public {
        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(thirdChain);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.UnsupportedChain.selector, thirdChain));
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

        vm.expectRevert(
            abi.encodeWithSelector(IOtcMarket.OnlyWormholeRelayer.selector, address(this))
        );
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
        _createOffer(firstOtcMarket, secondChain, firstToken, address(secondToken));
        performDelivery();

        

        uint256 offerId = firstOtcMarket.hashOffer(
            address(this),
            firstChain,
            secondChain,
            address(firstToken),
            address(secondToken),
            EXCHANGE_RATE
        );
        // check added offer on first chain
        (address seller, , , , , , ,) = firstOtcMarket.offers(offerId);
        assertEq(seller, address(this));

        vm.selectFork(secondFork);
        // check added offer on second chain
        (seller, , , , , , ,) = secondOtcMarket.offers(offerId);
        assertEq(seller, address(this));



        vm.selectFork(secondFork);
        uint256 cost2 = secondOtcMarket.quoteCrossChainDelivery(firstChain);

        vm.selectFork(firstFork);
        uint256 cost1 = firstOtcMarket.quoteCrossChainDelivery(secondChain, cost2);

        vm.selectFork(secondFork);

        vm.selectFork(firstFork);
        firstOtcMarket.cancelOffer{value: cost1}
        (
            offerId, 
            cost2
        );

        vm.selectFork(secondFork);

        vm.expectEmit(true, false, false, false, address(secondOtcMarket));
        emit IOtcMarket.OfferCancelationRequestReceived(offerId);

        vm.selectFork(firstFork);
        performDelivery();

        vm.selectFork(firstFork);
        vm.expectEmit(true, false, false, false, address(firstOtcMarket));
        emit IOtcMarket.OfferCancelled(offerId);

        vm.selectFork(secondFork);
        performDelivery();


        //check offer was deleted on second chain

        (seller, , , , , , ,) = secondOtcMarket.offers(offerId);
        assertEq(seller, address(0));


        //check offer was deleted on first chain
        vm.selectFork(firstFork);
        (seller, , , , , , ,) = firstOtcMarket.offers(offerId);
        assertEq(seller, address(0));

    }
}
