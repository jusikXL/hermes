import {
  Environment,
  StandardRelayerApp,
  StandardRelayerContext,
} from "@wormhole-foundation/relayer-engine";
import { CHAIN_ID_FANTOM, CHAIN_ID_SOLANA } from "@certusone/wormhole-sdk";

import { transferVaa } from "./controller";

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
      [CHAIN_ID_SOLANA]: "J8QPQeVKdQ3VvjaEcuzmjnos99AmesfFRNSiVms9apdn",
      [CHAIN_ID_FANTOM]: "0xFc642eEDBb585ee8667e0256FaFeD6ce73939a0f",
    },
    async (ctx, next) => {
      const vaa_bytes = ctx.vaaBytes;

      ctx.logger.warn("Got a VAA");
      // transferVaa(ctx);
      // ctx.logger.info(`chain middleware - ${seq} - ${ctx.sourceTxHash}`);

      // invoke the next layer in the middleware pipeline
      await next();
    }
  );

  await app.listen();
})();
