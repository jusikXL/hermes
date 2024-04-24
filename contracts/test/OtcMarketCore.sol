// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IOtcMarket} from "../src/OtcMarket/IOtcMarket.sol";
import {MyOtcMarket} from "../src/OtcMarket/MyOtcMarket.sol";
import {MyToken} from "../src/MyToken.sol";

import {WormholeRelayerTrippleTest} from "./utils/WormholeRelayerTrippleTest.sol";
import {OtcMarketFixtures} from "./utils/OtcMarketFixtures.sol";

import "forge-std/Test.sol";

import "wormhole-solidity-sdk/Utils.sol";

abstract contract OtcMarketCoreTest is WormholeRelayerTrippleTest, OtcMarketFixtures {
    MyOtcMarket public firstOtcMarket;
    MyOtcMarket public secondOtcMarket;
    MyOtcMarket public thirdOtcMarket;

    MyToken public firstToken;
    MyToken public secondToken;
    MyToken public thirdToken;

    uint256 public constant EXCHANGE_RATE = 2 ether;
    uint256 public constant AMOUNT = 100 ether;
    uint256 public constant MINTED = 1000 ether;

    constructor() WormholeRelayerTrippleTest([uint16(14), uint16(4), uint16(6)]) {}

    function setUpFirst() public override {
        firstOtcMarket = new MyOtcMarket(firstChain, address(this), address(firstRelayer));
        firstToken = new MyToken(address(this));
        firstToken.mint(address(this), MINTED);
    }

    function setUpSecond() public override {
        secondOtcMarket = new MyOtcMarket(secondChain, address(this), address(secondRelayer));
        secondToken = new MyToken(address(this));
        secondToken.mint(address(this), MINTED);
    }

    function setUpThird() public override {
        thirdOtcMarket = new MyOtcMarket(thirdChain, address(this), address(thirdRelayer));
        thirdToken = new MyToken(address(this));
        thirdToken.mint(address(this), MINTED);
    }

    function setUpGeneral() public override {
        firstOtcMarket.listOtcMarket(secondChain, address(secondOtcMarket));

        vm.selectFork(secondFork);
        secondOtcMarket.listOtcMarket(firstChain, address(firstOtcMarket));
        secondOtcMarket.listOtcMarket(thirdChain, address(thirdOtcMarket));

        vm.selectFork(thirdFork);
        thirdOtcMarket.listOtcMarket(secondChain, address(secondOtcMarket));
    }
}
