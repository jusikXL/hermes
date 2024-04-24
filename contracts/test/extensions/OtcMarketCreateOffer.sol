// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../OtcMarketCore.sol";

abstract contract OtcMarketCreateOfferTest is OtcMarketCoreTest {
    function testCreateOffer_Positive(uint248 amount) public {
        vm.assume(amount > 0);

        vm.selectFork(0);
        firstToken.mint(address(this), amount);
        firstToken.approve(address(firstOtcMarket), amount);
        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(secondChain, 0);

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
            amount,
            EXCHANGE_RATE
        );
        firstOtcMarket.createOffer{value: cost}(
            secondChain,
            address(this),
            address(firstToken),
            address(secondToken),
            amount,
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
            amount,
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
        assertEq(a, amount);
        assertEq(er, EXCHANGE_RATE);
    }

    function testCreateOffer_InvalidPrice() public {
        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(secondChain, 0);

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
        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(thirdChain, 0);

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
        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(secondChain, 0);

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

    function testCreateOffer_OfferAlreadyExists() public {
        uint256 offerId = _createOfferFixture(
            address(this),
            firstOtcMarket,
            secondChain,
            firstToken,
            address(secondToken),
            AMOUNT,
            EXCHANGE_RATE
        );

        uint256 cost = firstOtcMarket.quoteCrossChainDelivery(secondChain, 0);
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

        address fakeRelayer = makeAddr("fake relayer");
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

        address fakeOtc = makeAddr("fake otc");
        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.OnlyOtc.selector, fakeOtc));
        vm.prank(address(firstRelayer));
        firstOtcMarket.receiveWormholeMessages(
            payload,
            new bytes[](0),
            toWormholeFormat(fakeOtc),
            secondChain,
            bytes32(0)
        );
    }

    function testCreateOffer_RelayedToWrongOtc() public {
        vm.selectFork(thirdFork);

        uint256 offerId = thirdOtcMarket.hashOffer(
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
            0,
            IOtcMarket.CrossChainMessages.OfferCreated,
            abi.encode(offerId, offer)
        );

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InvalidChain.selector, thirdChain));
        vm.prank(address(thirdRelayer));
        thirdOtcMarket.receiveWormholeMessages(
            payload,
            new bytes[](0),
            toWormholeFormat(address(secondOtcMarket)),
            secondChain,
            bytes32(0)
        );
    }
}
