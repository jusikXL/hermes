import {
  Environment,
  StandardRelayerApp,
  StandardRelayerContext,
} from "@wormhole-foundation/relayer-engine";
import { Controller } from "./controller";
import { DeliveryContext, delivery } from "./middleware";
import { programId } from "./solana";
import { address } from "./evm";

export type HermesRelayerContext = StandardRelayerContext & DeliveryContext;

(async function main() {
  const app = new StandardRelayerApp<HermesRelayerContext>(
    Environment.TESTNET,
    // other app specific config options can be set here for things
    // like retries, logger, or redis connection settings.
    {
      name: `HermesRelayer`,
    }
  );
  app.use(delivery());

  const controller = new Controller();
  app.multiple(
    {
      [1]: programId,
      [10]: address,
    },
    controller.redeemVaa
  );
  await app.listen();
})();
