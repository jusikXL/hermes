// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OtcMarketCreateOfferTest} from "./extensions/OtcMarketCreateOffer.sol";
import {OtcMarketAcceptOfferTest} from "./extensions/OtcMarketAcceptOffer.sol";
import {OtcMarketCancelOfferTest} from "./extensions/OtcMarketCancelOffer.sol";
import {OtcMarketGeneralTest} from "./extensions/OtcMarketGeneral.sol";
import {OtcMarketCoreTest} from "./OtcMarketCore.sol";

contract OtcMarketTest is
    OtcMarketCoreTest,
    OtcMarketCreateOfferTest,
    OtcMarketAcceptOfferTest,
    OtcMarketCancelOfferTest,
    OtcMarketGeneralTest
{}
