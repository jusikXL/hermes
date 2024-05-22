import { Context, Middleware } from "@wormhole-foundation/relayer-engine";
import {
  PlatformContext,
  Signer,
  WormholeCore,
  loadProtocols,
} from "@wormhole-foundation/sdk";
import solana from "@wormhole-foundation/sdk/platforms/solana";
import evm from "@wormhole-foundation/sdk/platforms/evm";
import base58 from "bs58";
import { secretKey } from "./solana";

export interface DeliveryContext extends Context {
  deliver: (
    deliverFunction: (ctx: DeliveryContext) => Promise<void>
  ) => Promise<void>;

  solanaPlatform: PlatformContext<"Testnet", "Solana">;
  solanaCoreBridge: WormholeCore<"Testnet", "Solana">;
  solanaSigner: Signer;

  evmPlatform: PlatformContext<"Testnet", "Evm">;
}

export function delivery(): Middleware<DeliveryContext> {
  return async (ctx, next) => {
    await loadProtocols(solana, ["WormholeCore"]);
    await loadProtocols(evm);

    const solanaPlatform = new solana.Platform("Testnet");
    const solanaChain = solanaPlatform.getChain("Solana");
    const solanaCoreBridge = await solanaChain.getWormholeCore();
    const solanaSigner = await solana.getSigner(
      await solanaChain.getRpc(),
      base58.encode(secretKey)
    );
    ctx.solanaPlatform = solanaPlatform;
    ctx.solanaCoreBridge = solanaCoreBridge;
    ctx.solanaSigner = solanaSigner;

    const evmPlatform = new evm.Platform("Testnet");
    ctx.evmPlatform = evmPlatform;

    // deliver
    if (ctx.vaaBytes) {
      ctx.deliver = async (
        deliverFunction: (ctx: DeliveryContext) => Promise<void>
      ): Promise<void> => {
        try {
          ctx.logger?.debug("Initiating delivery...");
          await deliverFunction(ctx);
          ctx.logger?.info("Delivery completed!");
        } catch (err: any) {
          ctx.logger?.error(`Delivery failed ${err.message}`);
        }
      };
    }

    await next();
  };
}
