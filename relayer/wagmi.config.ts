import { defineConfig } from "@wagmi/cli";
import { blockExplorer } from "@wagmi/cli/plugins";

import { chain as evmChain } from "./src/evm";
import { evmAddress } from "./src/address";

export default defineConfig({
  out: "src/config/evm/abi.ts",
  contracts: [],
  plugins: [
    blockExplorer({
      baseUrl: evmChain.blockExplorers.default.apiUrl,
      contracts: [
        {
          name: "OtcMarket",
          address: evmAddress,
        },
      ],
    }),
  ],
});
