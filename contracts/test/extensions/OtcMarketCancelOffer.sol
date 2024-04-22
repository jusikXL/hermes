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
}
