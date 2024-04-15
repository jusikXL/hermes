// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OtcMarket} from "../src/OtcMarket/OtcMarket.sol";
import {IOtcMarket} from "../src/OtcMarket/IOtcMarket.sol";
import {console} from "forge-std/Test.sol";
import "wormhole-solidity-sdk/testing/WormholeRelayerTest.sol";

contract OtcMarketTest is WormholeRelayerBasicTest {
    OtcMarket public sourceOtcMarket;
    OtcMarket public targetOtcMarket;

    ERC20Mock public sourceToken;
    ERC20Mock public targetToken;

    uint256 public constant EXCHANGE_RATE = 2;
    uint256 public constant AMOUNT = 1e18;

    function setUpSource() public override {
        sourceOtcMarket = new OtcMarket(sourceChain, address(this), address(relayerSource));

        sourceToken = new ERC20Mock("Token 1", "TKN1");
        sourceToken.mint(address(this), 100e18);
    }

    function setUpTarget() public override {
        targetOtcMarket = new OtcMarket(targetChain, address(this), address(relayerTarget));

        targetToken = new ERC20Mock("Token 2", "TKN2");
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
        performDelivery(true);

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
}
