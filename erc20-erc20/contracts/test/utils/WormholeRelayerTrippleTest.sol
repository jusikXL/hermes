// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "wormhole-solidity-sdk/testing/WormholeRelayerTest.sol";

abstract contract WormholeRelayerTrippleTest is WormholeRelayerTest {
    uint16 public firstChain;
    uint16 public secondChain;
    uint16 public thirdChain;

    IWormholeRelayer public firstRelayer;
    IWormholeRelayer public secondRelayer;
    IWormholeRelayer public thirdRelayer;

    uint256 public firstFork;
    uint256 public secondFork;
    uint256 public thirdFork;

    constructor(uint16[3] memory chains) WormholeRelayerTest() {
        firstChain = chains[0];
        secondChain = chains[1];
        thirdChain = chains[2];

        firstFork = 0;
        secondFork = 1;
        thirdFork = 2;

        ChainInfo[] memory chainInfos = new ChainInfo[](3);
        chainInfos[0] = chainInfosTestnet[firstChain];
        chainInfos[1] = chainInfosTestnet[secondChain];
        chainInfos[2] = chainInfosTestnet[thirdChain];

        firstRelayer = chainInfos[0].relayer;
        secondRelayer = chainInfos[1].relayer;
        thirdRelayer = chainInfos[2].relayer;

        _setActiveForks(chainInfos);
    }

    function setUpFork(ActiveFork memory fork) public virtual override {
        if (fork.chainId == firstChain) {
            setUpFirst();
        } else if (fork.chainId == secondChain) {
            setUpSecond();
        } else if (fork.chainId == thirdChain) {
            setUpThird();
        } else {
            setUpOther(fork);
        }
    }

    function setUpFirst() public virtual {}
    function setUpSecond() public virtual {}
    function setUpThird() public virtual {}
    function setUpOther(ActiveFork memory fork) public virtual {}

    function setUpGeneral() public virtual override {}
}
