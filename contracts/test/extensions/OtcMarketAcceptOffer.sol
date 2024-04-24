// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../OtcMarketCore.sol";

abstract contract OtcMarketAcceptOfferTest is OtcMarketCoreTest {
    function testAcceptOffer_Positive() public {
        uint256 ACCEPT_OFFER_AMOUNT = AMOUNT / 3;
        vm.recordLogs();
        address seller = makeAddr("seller");
        address buyer = makeAddr("buyer");
        // setting up
        vm.deal(seller, 10 ether);
        firstToken.mint(seller, AMOUNT);

        vm.selectFork(secondFork);
        vm.deal(buyer, 10 ether);
        secondToken.mint(buyer, (ACCEPT_OFFER_AMOUNT * EXCHANGE_RATE) / 1 ether);

        vm.selectFork(firstFork);
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
        vm.stopPrank();
        performDelivery();

        vm.selectFork(secondFork);

        vm.startPrank(buyer);
        secondToken.approve(
            address(secondOtcMarket),
            (ACCEPT_OFFER_AMOUNT * EXCHANGE_RATE) / 1 ether
        );

        uint256 cost = secondOtcMarket.quoteCrossChainDelivery(firstChain, 0);

        vm.expectEmit(true, true, false, false, address(secondOtcMarket));
        emit IOtcMarket.OfferAccepted(offerId, buyer, ACCEPT_OFFER_AMOUNT);

        secondOtcMarket.acceptOffer{value: cost}(offerId, ACCEPT_OFFER_AMOUNT);
        vm.stopPrank();

        vm.selectFork(firstFork);

        vm.expectEmit(true, true, false, false, address(firstOtcMarket));
        emit IOtcMarket.OfferAccepted(offerId, buyer, ACCEPT_OFFER_AMOUNT);

        vm.selectFork(secondFork);
        performDelivery();
        // check balances were modified
        uint256 fee = 1 ether;
        uint256 sellerBalance = secondToken.balanceOf(seller);
        uint256 buyerBalance = secondToken.balanceOf(buyer);
        (, , , , , , uint256 sourceTokenAmount, ) = secondOtcMarket.offers(offerId);

        assertEq(sourceTokenAmount, AMOUNT - ACCEPT_OFFER_AMOUNT, "target chain offer amount");
        assertEq(buyerBalance, 0, "target chain buyer balance");
        assertEq(
            sellerBalance,
            (ACCEPT_OFFER_AMOUNT * EXCHANGE_RATE) / 1 ether - fee,
            "target chain seller balance"
        );

        vm.selectFork(firstFork);
        sellerBalance = firstToken.balanceOf(seller);
        buyerBalance = firstToken.balanceOf(buyer);
        (, , , , , , sourceTokenAmount, ) = firstOtcMarket.offers(offerId);

        assertEq(sourceTokenAmount, AMOUNT - ACCEPT_OFFER_AMOUNT, "source chain offer amount");
        assertEq(buyerBalance, ACCEPT_OFFER_AMOUNT, "source chain buyer balance");
        assertEq(sellerBalance, 0, "source chain seller balance");
    }

    function testAcceptOffer_InsufficientValue() public {
        uint256 ACCEPT_OFFER_AMOUNT = AMOUNT / 3;
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
        uint256 cost = secondOtcMarket.quoteCrossChainDelivery(firstChain, 0);
        secondToken.approve(address(secondOtcMarket), ACCEPT_OFFER_AMOUNT * EXCHANGE_RATE);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InsufficientValue.selector, 0, cost));
        secondOtcMarket.acceptOffer{value: 0}(offerId, ACCEPT_OFFER_AMOUNT);
    }

    function testAcceptOffer_InvalidChain() public {
        // accept offer from seller chain
        uint256 ACCEPT_OFFER_AMOUNT = AMOUNT / 3;
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
        uint256 cost = secondOtcMarket.quoteCrossChainDelivery(firstChain, 0);
        vm.selectFork(firstFork);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InvalidChain.selector, firstChain));
        firstOtcMarket.acceptOffer{value: cost}(offerId, ACCEPT_OFFER_AMOUNT);
    }

    function testAcceptOffer_NonexistentOffer() public {
        uint256 ACCEPT_OFFER_AMOUNT = AMOUNT / 3;
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
        uint256 cost = secondOtcMarket.quoteCrossChainDelivery(firstChain, 0);
        secondToken.approve(address(secondOtcMarket), ACCEPT_OFFER_AMOUNT * EXCHANGE_RATE);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.NonexistentOffer.selector, offerId + 1));
        secondOtcMarket.acceptOffer{value: cost}(offerId + 1, ACCEPT_OFFER_AMOUNT);
    }

    function testAcceptOffer_ExcessiveAmount() public {
        uint256 ACCEPT_OFFER_AMOUNT = AMOUNT * 2;
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
        uint256 cost = secondOtcMarket.quoteCrossChainDelivery(firstChain, 0);
        secondToken.approve(
            address(secondOtcMarket),
            (ACCEPT_OFFER_AMOUNT * EXCHANGE_RATE) / 1 ether
        );

        vm.expectRevert(
            abi.encodeWithSelector(IOtcMarket.ExcessiveAmount.selector, ACCEPT_OFFER_AMOUNT, AMOUNT)
        );
        secondOtcMarket.acceptOffer{value: cost}(offerId, ACCEPT_OFFER_AMOUNT);
    }

    function testAcceptOffer_InvalidChainReceived() public {
        uint256 ACCEPT_OFFER_AMOUNT = AMOUNT / 3;
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

        vm.selectFork(thirdFork);
        bytes memory payload = abi.encode(
            0,
            IOtcMarket.CrossChainMessages.OfferAccepted,
            abi.encode(offerId, address(this), ACCEPT_OFFER_AMOUNT)
        );
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
