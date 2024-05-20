import { fantomTestnet } from "viem/chains";
import { defineChain } from "viem";

export const evmChain = defineChain({
  ...fantomTestnet,
  blockExplorers: {
    default: {
      ...fantomTestnet.blockExplorers.default,
      apiUrl: "https://api-testnet.ftmscan.com/api",
    },
  },
});

export const evmAddress: `0x${string}` =
  "0xFc642eEDBb585ee8667e0256FaFeD6ce73939a0f";
