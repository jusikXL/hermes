// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OtcMarket.sol";

contract MyOtcMarket is OtcMarket {
    constructor(
        uint16 chain,
        address initialOwner,
        address wormholeRelayer
    ) OtcMarket(chain, initialOwner, wormholeRelayer) {}
}
