import {
  Environment,
  StandardRelayerApp,
  StandardRelayerContext,
} from "@wormhole-foundation/relayer-engine";
import { CHAIN_ID_FANTOM, CHAIN_ID_SOLANA } from "@certusone/wormhole-sdk";

import { transferVaa } from "./controller";
import { otcMarketConfig } from "./config/evm/abi";
import { client } from "./config/evm/client";
import { evmAddress, solanaAddress } from "./contants";

(async function main() {
  const app = new StandardRelayerApp<StandardRelayerContext>(
    Environment.TESTNET,
    // other app specific config options can be set here for things
    // like retries, logger, or redis connection settings.
    {
      name: `ExampleRelayer`,
    }
  );
  app.multiple(
    {
      [CHAIN_ID_SOLANA]: solanaAddress,
      [CHAIN_ID_FANTOM]: evmAddress,
    },
    async (ctx, next) => {
      ctx.logger.warn("Got a VAA");

      const vaaBytes = ctx.vaaBytes;
      if (vaaBytes) {
        const vaaHex: `0x${string}` = `0x${Buffer.from(vaaBytes).toString(
          "hex"
        )}`;

        ctx.logger.warn(vaaHex);

        switch (ctx.vaa?.emitterChain) {
          case CHAIN_ID_SOLANA:
            const txHash = await client.writeContract({
              ...otcMarketConfig,
              functionName: "receiveMessage",
              args: [vaaHex],
            });
            ctx.logger.warn(txHash);
            break;
          case CHAIN_ID_FANTOM:
            transferVaa(ctx);
            break;
        }
      }

      // invoke the next layer in the middleware pipeline
      await next();
    }
  );
  await app.listen();
})();
