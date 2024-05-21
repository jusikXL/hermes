import { defineConfig } from "@wagmi/cli";
import { blockExplorer } from "@wagmi/cli/plugins";

import { chain, address } from "./src/evm";

export default defineConfig({
  out: "src/config/evm/abi.ts",
  contracts: [],
  plugins: [
    blockExplorer({
      baseUrl: chain.blockExplorers.default.apiUrl,
      contracts: [
        {
          name: "OtcMarket",
          address: address,
        },
      ],
    }),
  ],
});
