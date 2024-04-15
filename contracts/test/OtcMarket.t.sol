// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OtcMarket} from "../src/OtcMarket/OtcMarket.sol";
import {IOtcMarket} from "../src/OtcMarket/IOtcMarket.sol";
import {console} from "forge-std/Test.sol";
import {MyToken} from "../src/MyToken.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import "wormhole-solidity-sdk/testing/WormholeRelayerTest.sol";

contract OtcMarketTest is WormholeRelayerBasicTest, IERC20Errors {
    OtcMarket public sourceOtcMarket;
    OtcMarket public targetOtcMarket;

    MyToken public sourceToken;
    MyToken public targetToken;

    uint256 public constant EXCHANGE_RATE = 2;
    uint256 public constant AMOUNT = 1e18;

    function setUpSource() public override {
        sourceOtcMarket = new OtcMarket(sourceChain, address(this), address(relayerSource));

        sourceToken = new MyToken(address(this));
        sourceToken.mint(address(this), 100e18);
    }

    function setUpTarget() public override {
        targetOtcMarket = new OtcMarket(targetChain, address(this), address(relayerTarget));

        targetToken = new MyToken(address(this));
        targetToken.mint(address(this), 100e18);
    }

    function setUpGeneral() public override {
        sourceOtcMarket.listOtcMarket(targetChain, address(targetOtcMarket));

        vm.selectFork(targetFork);
        targetOtcMarket.listOtcMarket(sourceChain, address(sourceOtcMarket));
    }

    function testCreateOffer() public {
        sourceToken.approve(address(sourceOtcMarket), AMOUNT);
        uint256 cost = sourceOtcMarket.quoteCrossChainDelivery(targetChain);

        uint256 offerId = sourceOtcMarket.hashOffer(
            address(this),
            sourceChain,
            targetChain,
            address(sourceToken),
            address(targetToken),
            EXCHANGE_RATE
        );

        vm.recordLogs();
        vm.expectEmit(true, true, true, true, address(sourceOtcMarket));
        emit IOtcMarket.OfferCreated(
            offerId,
            address(this),
            address(this),
            sourceChain,
            targetChain,
            address(sourceToken),
            address(targetToken),
            AMOUNT,
            EXCHANGE_RATE
        );
        sourceOtcMarket.createOffer{value: cost}(
            targetChain,
            address(this),
            address(sourceToken),
            address(targetToken),
            AMOUNT,
            EXCHANGE_RATE
        );

        vm.selectFork(targetFork);
        vm.expectEmit(true, false, false, false, address(targetOtcMarket));
        emit IOtcMarket.OfferReceived(offerId);

        vm.selectFork(sourceFork);
        performDelivery();

        vm.selectFork(targetFork);
        (
            address mca,
            address mta,
            uint16 sc,
            uint16 tc,
            address sta,
            address tta,
            uint256 a,
            uint256 er
        ) = targetOtcMarket.offers(offerId);

        assertEq(mca, address(this));
        assertEq(mta, address(this));
        assertEq(sc, sourceChain);
        assertEq(tc, targetChain);
        assertEq(sta, address(sourceToken));
        assertEq(tta, address(targetToken));
        assertEq(a, AMOUNT);
        assertEq(er, EXCHANGE_RATE);
    }

    function testCreateOffer_InsufficientAllowance() public {
        uint256 cost = sourceOtcMarket.quoteCrossChainDelivery(targetChain);

        vm.expectRevert(
            abi.encodeWithSelector(
                ERC20InsufficientAllowance.selector,
                address(sourceOtcMarket),
                0,
                AMOUNT
            )
        );
        sourceOtcMarket.createOffer{value: cost}(
            targetChain,
            address(this),
            address(sourceToken),
            address(targetToken),
            AMOUNT,
            EXCHANGE_RATE
        );
    }

    function testCreateOffer_InvalidPrice() public {
        uint256 cost = sourceOtcMarket.quoteCrossChainDelivery(targetChain);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InvalidPrice.selector, 0, EXCHANGE_RATE));
        sourceOtcMarket.createOffer{value: cost}(
            targetChain,
            address(this),
            address(sourceToken),
            address(targetToken),
            0,
            EXCHANGE_RATE
        );

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InvalidPrice.selector, AMOUNT, 0));
        sourceOtcMarket.createOffer{value: cost}(
            targetChain,
            address(this),
            address(sourceToken),
            address(targetToken),
            AMOUNT,
            0
        );

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InvalidPrice.selector, 0, 0));
        sourceOtcMarket.createOffer{value: cost}(
            targetChain,
            address(this),
            address(sourceToken),
            address(targetToken),
            0,
            0
        );
    }

    function testCreateOffer_UnsupportedChain() public {
        uint256 cost = sourceOtcMarket.quoteCrossChainDelivery(sourceChain);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.UnsupportedChain.selector, sourceChain));
        sourceOtcMarket.createOffer{value: cost}(
            sourceChain,
            address(this),
            address(sourceToken),
            address(targetToken),
            AMOUNT,
            EXCHANGE_RATE
        );
    }

    function testCreateOffer_InsufficientValue() public {
        uint256 cost = sourceOtcMarket.quoteCrossChainDelivery(targetChain);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.InsufficientValue.selector, 0, cost));
        sourceOtcMarket.createOffer{value: 0}(
            targetChain,
            address(this),
            address(sourceToken),
            address(targetToken),
            AMOUNT,
            EXCHANGE_RATE
        );
    }

    function _createOffer() private {
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
        _createOffer();

        uint256 offerId = sourceOtcMarket.hashOffer(
            address(this),
            sourceChain,
            targetChain,
            address(sourceToken),
            address(targetToken),
            EXCHANGE_RATE
        );
        uint256 cost = sourceOtcMarket.quoteCrossChainDelivery(targetChain);
        sourceToken.approve(address(sourceOtcMarket), AMOUNT);

        vm.expectRevert(abi.encodeWithSelector(IOtcMarket.OfferAlreadyExists.selector, offerId));
        sourceOtcMarket.createOffer{value: cost}(
            targetChain,
            address(this),
            address(sourceToken),
            address(targetToken),
            AMOUNT,
            EXCHANGE_RATE
        );
    }
}
