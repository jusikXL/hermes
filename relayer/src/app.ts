import {
  Environment,
  StandardRelayerApp,
  StandardRelayerContext,
} from "@wormhole-foundation/relayer-engine";
import { CHAIN_ID_FANTOM, CHAIN_ID_SOLANA } from "@certusone/wormhole-sdk";
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
      [CHAIN_ID_SOLANA]: programId,
      [CHAIN_ID_FANTOM]: address,
    },
    controller.redeemVaa
  );

  await app.listen();
})();
