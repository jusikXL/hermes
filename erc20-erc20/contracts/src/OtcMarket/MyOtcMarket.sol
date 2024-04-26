// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OtcMarket} from "./OtcMarket.sol";
import {OtcMarketCreateOffer} from "./extensions/OtcMarketCreateOffer.sol";
import {OtcMarketAcceptOffer} from "./extensions/OtcMarketAcceptOffer.sol";
import {OtcMarketCancelOffer} from "./extensions/OtcMarketCancelOffer.sol";
import {OtcMarketMessenger} from "./extensions/OtcMarketMessenger.sol";

contract MyOtcMarket is
    OtcMarket,
    OtcMarketCreateOffer,
    OtcMarketAcceptOffer,
    OtcMarketCancelOffer,
    OtcMarketMessenger
{
    constructor(
        uint16 chain,
        address initialOwner,
        address wormholeRelayer
    ) OtcMarket(chain, initialOwner) OtcMarketMessenger(wormholeRelayer) {}
}
