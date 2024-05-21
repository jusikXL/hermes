import { Next } from "@wormhole-foundation/relayer-engine";
import { CHAIN_ID_FANTOM, CHAIN_ID_SOLANA } from "@certusone/wormhole-sdk";
import { HermesRelayerContext } from "./app";
import { transferVaa } from "./controller";
import { program, provider } from "./solana/client";
import { deliver as deliverToEvm } from "./evm";

export class Controller {
  redeemVaa = async (ctx: HermesRelayerContext, next: Next) => {
    const vaa = ctx.vaa;

    if (vaa) {
      const vaaBytes = vaa.bytes;
      const vaaHex: `0x${string}` = `0x${Buffer.from(vaaBytes).toString(
        "hex"
      )}`;

      switch (vaa.emitterChain) {
        case CHAIN_ID_SOLANA:
          await ctx.deliver(deliverToEvm, vaaHex);
          break;
        case CHAIN_ID_FANTOM:
          transferVaa(provider, program, ctx);
          break;
      }
    }

    // invoke the next layer in the middleware pipeline
    await next();
  };
}
