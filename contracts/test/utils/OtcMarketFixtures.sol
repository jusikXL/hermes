// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OtcMarket} from "../../src/OtcMarket/OtcMarket.sol";
import {MyToken} from "../../src/MyToken.sol";

abstract contract OtcMarketFixtures {
    function _createOfferFixture(
        address sellerTargetAddress,
        OtcMarket sourceOtcMarket,
        uint16 targetChain,
        MyToken sourceToken,
        address targetToken,
        uint256 sourceTokenAmount,
        uint256 exchangeRate
    ) internal returns (uint256 offerId) {
        uint256 cost = sourceOtcMarket.quoteCrossChainDelivery(targetChain);
        sourceToken.approve(address(sourceOtcMarket), sourceTokenAmount);
        offerId = sourceOtcMarket.createOffer{value: cost}(
            targetChain,
            sellerTargetAddress,
            address(sourceToken),
            address(targetToken),
            sourceTokenAmount,
            exchangeRate
        );
    }
}
