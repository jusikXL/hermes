import { Next } from "@wormhole-foundation/relayer-engine";
import { CHAIN_ID_FANTOM, CHAIN_ID_SOLANA } from "@certusone/wormhole-sdk";
import { HermesRelayerContext } from "./app";
import { transferVaa } from "./controller";
import { program, provider } from "./solana/client";

export class Controller {
  redeemVaa = async (ctx: HermesRelayerContext, next: Next) => {
    const vaa = ctx.vaa;
    if (vaa) {
      switch (ctx.vaa?.emitterChain) {
        case CHAIN_ID_SOLANA:
          // trigger delivery middleware
          await ctx.solanaToEvm();
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
