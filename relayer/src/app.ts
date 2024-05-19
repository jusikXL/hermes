import {
  Environment,
  StandardRelayerApp,
  StandardRelayerContext,
} from "@wormhole-foundation/relayer-engine";
import { CHAIN_ID_FANTOM } from "@certusone/wormhole-sdk";

import {transferVaa} from './controller';




(async function main() {
  const app = new StandardRelayerApp<StandardRelayerContext>(
    Environment.TESTNET,
    // other app specific config options can be set here for things
    // like retries, logger, or redis connection settings.
    {
      name: `ExampleRelayer`,
    }
  );


  app
    .chain(CHAIN_ID_FANTOM)
    .address(
      "0xFc642eEDBb585ee8667e0256FaFeD6ce73939a0f",
      async (ctx, next) => {
        const vaa_bytes = ctx.vaaBytes;

        transferVaa(ctx);
        // ctx.logger.info(`chain middleware - ${seq} - ${ctx.sourceTxHash}`);

        // invoke the next layer in the middleware pipeline
        await next();
      }
    );

  // passing a function with 3 args will be used to process errors
  // (whenever you throw from your middleware)
  app.use(async (err, ctx, next) => {
    ctx.logger.error("error middleware triggered");
  });

  await app.listen();
})();
