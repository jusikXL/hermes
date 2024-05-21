import { client } from "./client";
import { otcMarketConfig } from "./config";

export default async function deliver(vaaHex: `0x${string}`) {
  return client.writeContract({
    ...otcMarketConfig,
    functionName: "receiveMessage",
    args: [vaaHex],
  });
}
