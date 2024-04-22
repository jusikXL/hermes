// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../OtcMarketCore.sol";

abstract contract OtcMarketCancelOfferTest is OtcMarketCoreTest {
    function testCancelOffer_Positive() public {
        vm.recordLogs();
        address seller = makeAddr("seller");
        firstToken.mint(seller, AMOUNT);
        vm.deal(seller, 10 ether);

        vm.startPrank(seller);
        uint256 offerId = _createOfferFixture(
            seller,
            firstOtcMarket,
            secondChain,
            firstToken,
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );
        performDelivery();

        vm.selectFork(secondFork);
        uint256 targetCost = secondOtcMarket.quoteCrossChainDelivery(firstChain);
        vm.selectFork(firstFork);
        uint256 sourceCost = firstOtcMarket.quoteCrossChainDelivery(secondChain, targetCost);

        // source: cancel offer appeal
        firstOtcMarket.cancelOffer{value: sourceCost}(offerId, targetCost);

        vm.stopPrank();
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
        // check tokens have been refunded
        (address offerSeller, , , , , , , ) = secondOtcMarket.offers(offerId);
        assertEq(offerSeller, address(0));

        vm.selectFork(firstFork);
        (offerSeller, , , , , , , ) = firstOtcMarket.offers(offerId);
        uint256 sellerBalance = firstToken.balanceOf(seller);
        assertEq(offerSeller, address(0));
        assertEq(sellerBalance, AMOUNT);
    }

    function testCancelOffer_InvalidTargetCost() public {
        vm.recordLogs();

        uint256 offerId = _createOfferFixture(
            address(this),
            firstOtcMarket,
            secondChain,
            firstToken,
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );
        performDelivery();

        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(secondChain);

        firstOtcMarket.cancelOffer{value: cost}(offerId, 0);
        (, uint256 lastSourceEmittedMessage, uint256 lastSourceIncommingMessage) = firstOtcMarket
            .otherOtcMarkets(secondChain);
        performDelivery();

        vm.selectFork(secondFork);

        (address offerSeller, , , , , , , ) = secondOtcMarket.offers(offerId);
        (, , uint256 lastTargetReceivedMessage) = secondOtcMarket.otherOtcMarkets(firstChain);
        assertNotEq(offerSeller, address(0), "Target: offer was not deleted");
        assertEq(lastSourceEmittedMessage, lastTargetReceivedMessage);

        performDelivery();

        vm.selectFork(firstFork);

        (offerSeller, , , , , , , ) = firstOtcMarket.offers(offerId);
        (, , uint256 lastSourceReceivedMessage) = firstOtcMarket.otherOtcMarkets(secondChain);
        assertEq(lastSourceIncommingMessage, lastSourceReceivedMessage);
        assertNotEq(offerSeller, address(0), "Source: offer was not deleted");
    }

    function testCancelOffer_InsufficientValue() public {
        vm.recordLogs();

        uint256 offerId = _createOfferFixture(
            address(this),
            firstOtcMarket,
            secondChain,
            firstToken,
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );
        performDelivery();

        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(secondChain);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InsufficientValue.selector, 0, cost));
        firstOtcMarket.cancelOffer{value: 0}(offerId, 0);
    }

    function testCancelOffer_InvalidChainAppeal() public {
        vm.recordLogs();

        uint256 offerId = _createOfferFixture(
            address(this),
            firstOtcMarket,
            secondChain,
            firstToken,
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );
        performDelivery();

        uint256 targetCost = firstOtcMarket.quoteCrossChainDelivery(secondChain);

        vm.selectFork(secondFork);

        uint256 sourceCost = secondOtcMarket.quoteCrossChainDelivery(firstChain, targetCost);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InvalidChain.selector, secondChain));
        secondOtcMarket.cancelOffer{value: sourceCost}(offerId, targetCost);
    }

    function testCancelOffer_OnlySeller() public {
        vm.recordLogs();

        uint256 offerId = _createOfferFixture(
            address(this),
            firstOtcMarket,
            secondChain,
            firstToken,
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );
        performDelivery();

        vm.selectFork(secondFork);
        uint256 targetCost = secondOtcMarket.quoteCrossChainDelivery(secondChain);

        vm.selectFork(firstFork);
        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(secondChain, targetCost);

        address fakeSeller = makeAddr("fake seller");
        vm.deal(fakeSeller, 10 ether);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.OnlySeller.selector, fakeSeller));
        vm.prank(fakeSeller);
        firstOtcMarket.cancelOffer{value: cost}(offerId, targetCost);
    }

    function testCancelOffer_InvalidChainAppealReceived() public {
        vm.recordLogs();

        uint256 offerId = _createOfferFixture(
            address(this),
            firstOtcMarket,
            secondChain,
            firstToken,
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );
        performDelivery();

        bytes memory payload = abi.encode(
            0,
            IOtcMarket.CrossChainMessages.OfferCancelAppeal,
            abi.encode(offerId)
        );

        vm.selectFork(thirdFork);
        vm.prank(address(thirdRelayer));

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InvalidChain.selector, thirdChain));
        thirdOtcMarket.receiveWormholeMessages(
            payload,
            new bytes[](0),
            toWormholeFormat(address(secondOtcMarket)),
            secondChain,
            bytes32(0)
        );
    }

    function testCancelOffer_InvalidChainCancelReceived() public {
        vm.recordLogs();

        uint256 offerId = _createOfferFixture(
            address(this),
            firstOtcMarket,
            secondChain,
            firstToken,
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );
        performDelivery();

        bytes memory payload = abi.encode(
            0,
            IOtcMarket.CrossChainMessages.OfferCanceled,
            abi.encode(offerId)
        );

        vm.selectFork(thirdFork);
        vm.prank(address(thirdRelayer));

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InvalidChain.selector, thirdChain));
        thirdOtcMarket.receiveWormholeMessages(
            payload,
            new bytes[](0),
            toWormholeFormat(address(secondOtcMarket)),
            secondChain,
            bytes32(0)
        );
    }
}
