// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../OtcMarketCore.sol";

abstract contract OtcMarketAcceptOfferTest is OtcMarketCoreTest {
    function testAcceptOffer_Positive(
        uint128 offerAmount,
        uint128 exchangeRate,
        uint128 acceptAmount
    ) public {
        vm.assume(acceptAmount >= firstOtcMarket.MINIMUM_AMOUNT());
        vm.assume(offerAmount >= acceptAmount);
        vm.assume(exchangeRate >= firstOtcMarket.MINIMUM_EXCHANGE_RATE());

        vm.recordLogs();

        // introduce seller and buyer, mint and approve tokens, create offer
        address seller = makeAddr("seller");
        vm.deal(seller, 10 ether);
        firstToken.mint(seller, offerAmount);
        vm.startPrank(seller);
        uint256 offerId = _createOfferFixture(
            seller,
            firstOtcMarket,
            secondChain,
            firstToken,
            address(secondToken),
            offerAmount,
            exchangeRate
        );
        vm.stopPrank();
        performDelivery();

        vm.selectFork(secondFork);
        address buyer = makeAddr("buyer");
        vm.deal(buyer, 10 ether);
        uint256 targetAmount = (uint256(acceptAmount) * uint256(exchangeRate)) / 1 ether;
        uint256 fee = targetAmount / 100; // 1%
        secondToken.mint(buyer, targetAmount);
        vm.prank(buyer);
        secondToken.approve(address(secondOtcMarket), targetAmount);

        // accept offer
        uint256 cost = secondOtcMarket.quoteCrossChainDelivery(firstChain, 0);
        vm.expectEmit(true, true, false, false, address(secondOtcMarket));
        emit IOtcMarket.OfferAccepted(offerId, buyer, acceptAmount);
        vm.prank(buyer);
        secondOtcMarket.acceptOffer{value: cost}(offerId, acceptAmount);

        // expect OfferAccepted on source
        vm.selectFork(firstFork);
        vm.expectEmit(true, true, false, false, address(firstOtcMarket));
        emit IOtcMarket.OfferAccepted(offerId, buyer, acceptAmount);

        // deliver OfferAccepted
        vm.selectFork(secondFork);
        performDelivery();

        // check balances
        uint256 sellerBalance = secondToken.balanceOf(seller);
        uint256 buyerBalance = secondToken.balanceOf(buyer);
        (, , , , , , uint256 offerBalance, ) = secondOtcMarket.offers(offerId);

        assertNotEq(fee, 0);
        assertEq(offerBalance, offerAmount - acceptAmount, "target chain offer amount");
        assertEq(buyerBalance, 0, "target chain buyer balance");
        assertEq(sellerBalance, targetAmount - fee, "target chain seller balance");

        vm.selectFork(firstFork);
        sellerBalance = firstToken.balanceOf(seller);
        buyerBalance = firstToken.balanceOf(buyer);
        (, , , , , , offerBalance, ) = firstOtcMarket.offers(offerId);

        assertEq(offerBalance, offerAmount - acceptAmount, "source chain offer amount");
        assertEq(buyerBalance, acceptAmount, "source chain buyer balance");
        assertEq(sellerBalance, 0, "source chain seller balance");
    }

    function testAcceptOffer_InsufficientAmount() public {
        uint128 ACCEPT_OFFER_AMOUNT = 10 ** 12 - 1;
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

        vm.expectRevert(
            abi.encodeWithSelector(IOtcMarket.InsufficientAmount.selector, ACCEPT_OFFER_AMOUNT)
        );
        secondOtcMarket.acceptOffer{value: cost}(offerId, ACCEPT_OFFER_AMOUNT);
    }

    function testAcceptOffer_InsufficientValue() public {
        uint128 ACCEPT_OFFER_AMOUNT = AMOUNT / 3;
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

    function testAcceptOffer_InvalidChainSent() public {
        // accept offer from seller chain
        uint128 ACCEPT_OFFER_AMOUNT = AMOUNT / 3;
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

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InvalidChain.selector, firstChain));
        firstOtcMarket.acceptOffer{value: 1 ether}(offerId, ACCEPT_OFFER_AMOUNT);
    }

    function testAcceptOffer_NonexistentOffer() public {
        uint128 ACCEPT_OFFER_AMOUNT = AMOUNT / 3;
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
        uint128 ACCEPT_OFFER_AMOUNT = AMOUNT * 2;
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

        uint256 targetAmount = (uint256(ACCEPT_OFFER_AMOUNT) * uint256(EXCHANGE_RATE));

        secondToken.approve(address(secondOtcMarket), targetAmount);

        vm.expectRevert(
            abi.encodeWithSelector(IOtcMarket.ExcessiveAmount.selector, ACCEPT_OFFER_AMOUNT, AMOUNT)
        );
        secondOtcMarket.acceptOffer{value: cost}(offerId, ACCEPT_OFFER_AMOUNT);
    }

    function testAcceptOffer_InvalidChainReceived() public {
        uint128 ACCEPT_OFFER_AMOUNT = AMOUNT / 3;
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
