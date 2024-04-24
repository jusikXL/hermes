// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IOtcMarket} from "./IOtcMarket.sol";

/**
 * @dev See {IOtcMarket}.
 */
abstract contract OtcMarket is IOtcMarket, Ownable {
    uint16 public immutable chain;

    mapping(uint16 chain => ChainInfo) public otherOtcMarkets;
    mapping(uint256 offerId => Offer) public offers;

    constructor(uint16 _chain, address _initialOwner) Ownable(_initialOwner) {
        chain = _chain;
    }

    function listOtcMarket(
        uint16 targetChain,
        address otcMarket
    ) public virtual override onlyOwner {
        otherOtcMarkets[targetChain] = ChainInfo(otcMarket, uint256(0), uint256(0));
        emit OtcMarketListed(targetChain, otcMarket);
    }

    function hashOffer(
        address sellerSourceAddress,
        uint16 sourceChain,
        uint16 targetChain,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint256 exchangeRate
    ) public pure virtual override returns (uint256 offerId) {
        return
            uint256(
                keccak256(
                    abi.encode(
                        sellerSourceAddress,
                        sourceChain,
                        targetChain,
                        sourceTokenAddress,
                        targetTokenAddress,
                        exchangeRate
                    )
                )
            );
    }

    function createOffer(
        uint16 targetChain,
        address sellerTargetAddress,
        address sourceTokenAddress,
        address targetTokenAddress,
        uint256 sourceTokenAmount,
        uint256 exchangeRate
    ) public payable virtual override returns (uint256 newOfferId);

    function acceptOffer(
        uint256 offerId,
        uint256 sourceTokenAmount
    ) public payable virtual override;

    function cancelOffer(uint256 offerId, uint256 targetCost) public payable virtual override;

    function quoteCrossChainDelivery(
        uint16 targetChain,
        uint256 receiverValue
    ) public view virtual override returns (uint256 cost);

    function _sendWormholeMessage(
        CrossChainMessages messageType,
        bytes memory messagePayload,
        uint16 targetChain,
        uint256 cost,
        uint256 targetCost
    ) internal virtual;
}
