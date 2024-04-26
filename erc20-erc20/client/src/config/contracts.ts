//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MyToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x7B7789A97B6b931269d95426bb1e328E93F077a4)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8011c2967d2b253774eCaEe78B92642cF2e0aa1e)
 */
export const myTokenAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'value', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burnFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const

/**
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x7B7789A97B6b931269d95426bb1e328E93F077a4)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8011c2967d2b253774eCaEe78B92642cF2e0aa1e)
 */
export const myTokenAddress = {
  84532: '0x7B7789A97B6b931269d95426bb1e328E93F077a4',
  11155420: '0x8011c2967d2b253774eCaEe78B92642cF2e0aa1e',
} as const

/**
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x7B7789A97B6b931269d95426bb1e328E93F077a4)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8011c2967d2b253774eCaEe78B92642cF2e0aa1e)
 */
export const myTokenConfig = {
  address: myTokenAddress,
  abi: myTokenAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OtcMarket
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x146eBBD4026726A4B80E21f259713944F3B7acF2)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x716CBA8A62CBc0F4f5715986B6763b211722f4E1)
 */
export const otcMarketAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'FEE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MINIMUM_AMOUNT',
    outputs: [{ name: '', internalType: 'uint128', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MINIMUM_EXCHANGE_RATE',
    outputs: [{ name: '', internalType: 'uint128', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'offerId', internalType: 'uint256', type: 'uint256' },
      { name: 'sourceTokenAmount', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'acceptOffer',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'offerId', internalType: 'uint256', type: 'uint256' },
      { name: 'targetCost', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'cancelOffer',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'chain',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targetChain', internalType: 'uint16', type: 'uint16' },
      { name: 'sellerTargetAddress', internalType: 'address', type: 'address' },
      { name: 'sourceTokenAddress', internalType: 'address', type: 'address' },
      { name: 'targetTokenAddress', internalType: 'address', type: 'address' },
      { name: 'sourceTokenAmount', internalType: 'uint128', type: 'uint128' },
      { name: 'exchangeRate', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'createOffer',
    outputs: [{ name: 'newOfferId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sellerSourceAddress', internalType: 'address', type: 'address' },
      { name: 'sourceChain', internalType: 'uint16', type: 'uint16' },
      { name: 'targetChain', internalType: 'uint16', type: 'uint16' },
      { name: 'sourceTokenAddress', internalType: 'address', type: 'address' },
      { name: 'targetTokenAddress', internalType: 'address', type: 'address' },
      { name: 'exchangeRate', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'hashOffer',
    outputs: [{ name: 'offerId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targetChain', internalType: 'uint16', type: 'uint16' },
      { name: 'otcMarket', internalType: 'address', type: 'address' },
    ],
    name: 'listOtcMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'offerId', internalType: 'uint256', type: 'uint256' }],
    name: 'offers',
    outputs: [
      { name: 'sellerSourceAddress', internalType: 'address', type: 'address' },
      { name: 'sellerTargetAddress', internalType: 'address', type: 'address' },
      { name: 'sourceChain', internalType: 'uint16', type: 'uint16' },
      { name: 'targetChain', internalType: 'uint16', type: 'uint16' },
      { name: 'sourceTokenAddress', internalType: 'address', type: 'address' },
      { name: 'targetTokenAddress', internalType: 'address', type: 'address' },
      { name: 'sourceTokenAmount', internalType: 'uint128', type: 'uint128' },
      { name: 'exchangeRate', internalType: 'uint128', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'chain', internalType: 'uint16', type: 'uint16' }],
    name: 'otherOtcMarkets',
    outputs: [
      { name: 'otcMarket', internalType: 'address', type: 'address' },
      { name: 'lastEmittedMessage', internalType: 'uint256', type: 'uint256' },
      { name: 'lastReceivedMessage', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targetChain', internalType: 'uint16', type: 'uint16' },
      { name: 'receiverValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'quoteCrossChainDelivery',
    outputs: [{ name: 'cost', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'offerId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sourceTokenAmount',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
    ],
    name: 'OfferAccepted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'offerId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'OfferCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'offerId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'sellerSourceAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'sellerTargetAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'sourceChain',
        internalType: 'uint16',
        type: 'uint16',
        indexed: true,
      },
      {
        name: 'targetChain',
        internalType: 'uint16',
        type: 'uint16',
        indexed: true,
      },
      {
        name: 'sourceTokenAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'targetTokenAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'sourceTokenAmount',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'exchangeRate',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
    ],
    name: 'OfferCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'chain', internalType: 'uint16', type: 'uint16', indexed: false },
      {
        name: 'otcMarket',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'OtcMarketListed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'error',
    inputs: [
      { name: 'amount', internalType: 'uint128', type: 'uint128' },
      { name: 'offerAmount', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'ExcessiveAmount',
  },
  {
    type: 'error',
    inputs: [{ name: 'amount', internalType: 'uint128', type: 'uint128' }],
    name: 'InsufficientAmount',
  },
  {
    type: 'error',
    inputs: [
      { name: 'exchangeRate', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'InsufficientExchangeRate',
  },
  {
    type: 'error',
    inputs: [
      { name: 'provided', internalType: 'uint256', type: 'uint256' },
      { name: 'required', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientValue',
  },
  {
    type: 'error',
    inputs: [{ name: 'chain', internalType: 'uint16', type: 'uint16' }],
    name: 'InvalidChain',
  },
  {
    type: 'error',
    inputs: [
      {
        name: 'recentReceivedMessage',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'InvalidMessageOrder',
  },
  {
    type: 'error',
    inputs: [{ name: 'offerId', internalType: 'uint256', type: 'uint256' }],
    name: 'NonexistentOffer',
  },
  {
    type: 'error',
    inputs: [{ name: 'offerId', internalType: 'uint256', type: 'uint256' }],
    name: 'OfferAlreadyExists',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OnlyOtc',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OnlySeller',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'OnlyWormholeRelayer',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const

/**
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x146eBBD4026726A4B80E21f259713944F3B7acF2)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x716CBA8A62CBc0F4f5715986B6763b211722f4E1)
 */
export const otcMarketAddress = {
  84532: '0x146eBBD4026726A4B80E21f259713944F3B7acF2',
  11155420: '0x716CBA8A62CBc0F4f5715986B6763b211722f4E1',
} as const

/**
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x146eBBD4026726A4B80E21f259713944F3B7acF2)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x716CBA8A62CBc0F4f5715986B6763b211722f4E1)
 */
export const otcMarketConfig = {
  address: otcMarketAddress,
  abi: otcMarketAbi,
} as const
