import {
  Environment,
  StandardRelayerApp,
  StandardRelayerContext,
} from "@wormhole-foundation/relayer-engine";
import { CHAIN_ID_FANTOM, CHAIN_ID_SOLANA } from "@certusone/wormhole-sdk";
import { evmAddress, solanaProgramId } from "./address";
import { Controller } from "./controllerV2";
import { DeliveryContext, delivery } from "./middleware";

export type HermesRelayerContext = StandardRelayerContext & DeliveryContext;

(async function main() {
  const app = new StandardRelayerApp<HermesRelayerContext>(
    Environment.TESTNET,
    // other app specific config options can be set here for things
    // like retries, logger, or redis connection settings.
    {
      name: `ExampleRelayer`,
    }
  );
  app.use(delivery());

  const controller = new Controller();

  app.multiple(
    {
      [CHAIN_ID_SOLANA]: solanaProgramId,
      [CHAIN_ID_FANTOM]: evmAddress,
    },
    controller.redeemVaa
  );

  await app.listen();
})();
