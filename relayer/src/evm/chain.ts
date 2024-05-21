import { fantomTestnet } from "viem/chains";
import { defineChain } from "viem";

export const chain = defineChain({
  ...fantomTestnet,
  blockExplorers: {
    default: {
      ...fantomTestnet.blockExplorers.default,
      apiUrl: "https://api-testnet.ftmscan.com/api",
    },
  },
});

export default chain;
