import { Context, Middleware } from "@wormhole-foundation/relayer-engine";
import { client } from "./evm/client";
import { otcMarketConfig } from "./evm/config";

export interface DeliveryContext extends Context {
  solanaToEvm(): Promise<void>;
}

export function delivery(): Middleware<DeliveryContext> {
  return async (ctx, next) => {
    const vaaBytes = ctx.vaaBytes;

    if (vaaBytes) {
      const vaaHex: `0x${string}` = `0x${Buffer.from(vaaBytes).toString(
        "hex"
      )}`;

      ctx.solanaToEvm = async () => {
        try {
          ctx.logger?.debug("Delivering from Solana to EVM...");
          await client.writeContract({
            ...otcMarketConfig,
            functionName: "receiveMessage",
            args: [vaaHex],
          });
          ctx.logger?.info("Successfully delivered from Solana to EVM!");
        } catch (err: any) {
          ctx.logger?.error(err.message);
        }
      };
    }

    await next();
  };
}
