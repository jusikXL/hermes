//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MyToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x3EB8F85aB7364bE9e10A898093fFe397870A2AE3)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x0D18B62A4e3f376fFAF5920a8ecbffce0e024539)
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
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x3EB8F85aB7364bE9e10A898093fFe397870A2AE3)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x0D18B62A4e3f376fFAF5920a8ecbffce0e024539)
 */
export const myTokenAddress = {
  84532: '0x3EB8F85aB7364bE9e10A898093fFe397870A2AE3',
  11155420: '0x0D18B62A4e3f376fFAF5920a8ecbffce0e024539',
} as const

/**
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x3EB8F85aB7364bE9e10A898093fFe397870A2AE3)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x0D18B62A4e3f376fFAF5920a8ecbffce0e024539)
 */
export const myTokenConfig = {
  address: myTokenAddress,
  abi: myTokenAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OtcMarket
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x59BCcF525121202FC7D60E0b7A0e88E32D041adB)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xdaB387705a29fce9a0e011595fe4778502BfEB22)
 */
export const otcMarketAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'GAS_LIMIT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'offerId', internalType: 'uint256', type: 'uint256' },
      { name: 'sourceTokenAmount', internalType: 'uint256', type: 'uint256' },
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
      { name: 'sourceTokenAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'exchangeRate', internalType: 'uint256', type: 'uint256' },
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
      { name: 'exchangeRate', internalType: 'uint256', type: 'uint256' },
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
      { name: 'sourceTokenAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'exchangeRate', internalType: 'uint256', type: 'uint256' },
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
    inputs: [{ name: 'targetChain', internalType: 'uint16', type: 'uint16' }],
    name: 'quoteCrossChainDelivery',
    outputs: [{ name: 'cost', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [
      { name: 'payload', internalType: 'bytes', type: 'bytes' },
      { name: '', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'sourceAddress', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sourceChain', internalType: 'uint16', type: 'uint16' },
      { name: '', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'receiveWormholeMessages',
    outputs: [],
    stateMutability: 'payable',
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
    type: 'function',
    inputs: [],
    name: 'wormholeRelayer',
    outputs: [
      { name: '', internalType: 'contract IWormholeRelayer', type: 'address' },
    ],
    stateMutability: 'view',
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
        internalType: 'uint256',
        type: 'uint256',
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
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'exchangeRate',
        internalType: 'uint256',
        type: 'uint256',
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
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'offerAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ExcessiveAmount',
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
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'exchangeRate', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidPrice',
  },
  {
    type: 'error',
    inputs: [{ name: 'offerId', internalType: 'uint256', type: 'uint256' }],
    name: 'NonexistentOffer',
  },
  {
    type: 'error',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'NotAnEvmAddress',
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
  { type: 'error', inputs: [], name: 'UnsupportedMessage' },
] as const

/**
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x59BCcF525121202FC7D60E0b7A0e88E32D041adB)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xdaB387705a29fce9a0e011595fe4778502BfEB22)
 */
export const otcMarketAddress = {
  84532: '0x59BCcF525121202FC7D60E0b7A0e88E32D041adB',
  11155420: '0xdaB387705a29fce9a0e011595fe4778502BfEB22',
} as const

/**
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x59BCcF525121202FC7D60E0b7A0e88E32D041adB)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xdaB387705a29fce9a0e011595fe4778502BfEB22)
 */
export const otcMarketConfig = {
  address: otcMarketAddress,
  abi: otcMarketAbi,
} as const
