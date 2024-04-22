// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../OtcMarketCore.sol";

abstract contract OtcMarketGeneralTest is OtcMarketCoreTest {
    function testMessageOrder() public {
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
        (, , uint256 lastReceivedMessage) = firstOtcMarket.otherOtcMarkets(secondChain);

        bytes memory messagePayload = abi.encode(offerId, address(this));
        bytes memory firstMessage = abi.encode(
            lastReceivedMessage,
            IOtcMarket.CrossChainMessages.OfferAccepted,
            messagePayload
        );

        uint256 nextReceivedMessage = uint256(keccak256(firstMessage));
        bytes memory secondMessage = abi.encode(
            nextReceivedMessage,
            IOtcMarket.CrossChainMessages.OfferAccepted,
            messagePayload
        );

        vm.prank(address(firstRelayer));
        vm.expectRevert(
            abi.encodeWithSelector(IOtcMarket.InvalidMessageOrder.selector, nextReceivedMessage)
        );
        firstOtcMarket.receiveWormholeMessages(
            secondMessage,
            new bytes[](0),
            toWormholeFormat(address(secondOtcMarket)),
            secondChain,
            bytes32(0)
        );
    }
}
