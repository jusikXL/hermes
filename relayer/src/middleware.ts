import { Context, Middleware } from "@wormhole-foundation/relayer-engine";

export interface DeliveryContext extends Context {
  deliver: <T extends any[]>(
    deliverFunction: (...args: T) => Promise<any>,
    ...args: T
  ) => Promise<void>;
}

export function delivery(): Middleware<DeliveryContext> {
  return async (ctx, next) => {
    const vaaBytes = ctx.vaaBytes;

    if (vaaBytes) {
      ctx.deliver = async <T extends any[]>(
        deliverFunction: (...args: T) => Promise<any>,
        ...args: T
      ): Promise<void> => {
        try {
          ctx.logger?.debug("Initiating delivery...");
          await deliverFunction(...args);
          ctx.logger?.info("Delivery completed!");
        } catch (err: any) {
          ctx.logger?.error(`Delivery failed ${err.message}`);
        }
      };
    }

    await next();
  };
}
