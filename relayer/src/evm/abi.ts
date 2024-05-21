//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OtcMarket
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const otcMarketAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'wormhole_', internalType: 'address', type: 'address' },
      { name: 'chainId_', internalType: 'uint16', type: 'uint16' },
      { name: 'wormholeFinality_', internalType: 'uint8', type: 'uint8' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'MessageReceived' },
  {
    type: 'function',
    inputs: [],
    name: 'chainId',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'encodedMessage', internalType: 'bytes', type: 'bytes' }],
    name: 'decodeMessage',
    outputs: [
      {
        name: 'parsedMessage',
        internalType: 'struct HelloWorldStructs.HelloWorldMessage',
        type: 'tuple',
        components: [
          { name: 'payloadID', internalType: 'uint8', type: 'uint8' },
          { name: 'message', internalType: 'string', type: 'string' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'parsedMessage',
        internalType: 'struct HelloWorldStructs.HelloWorldMessage',
        type: 'tuple',
        components: [
          { name: 'payloadID', internalType: 'uint8', type: 'uint8' },
          { name: 'message', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'encodeMessage',
    outputs: [{ name: 'encodedMessage', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'hash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getReceivedMessage',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'emitterChainId', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'getRegisteredEmitter',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'hash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isMessageConsumed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
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
    inputs: [{ name: 'encodedMessage', internalType: 'bytes', type: 'bytes' }],
    name: 'receiveMessage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'emitterChainId', internalType: 'uint16', type: 'uint16' },
      { name: 'emitterAddress', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'registerEmitter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'helloWorldMessage', internalType: 'string', type: 'string' },
    ],
    name: 'sendMessage',
    outputs: [
      { name: 'messageSequence', internalType: 'uint64', type: 'uint64' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'wormhole',
    outputs: [
      { name: '', internalType: 'contract IWormhole', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'wormholeFinality',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
] as const

export const otcMarketAddress =
  '0xFc642eEDBb585ee8667e0256FaFeD6ce73939a0f' as const

export const otcMarketConfig = {
  address: otcMarketAddress,
  abi: otcMarketAbi,
} as const
