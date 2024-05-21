import { client, otcMarketConfig } from ".";

export default async function deliver(vaaHex: `0x${string}`) {
  return client.writeContract({
    ...otcMarketConfig,
    functionName: "receiveMessage",
    args: [vaaHex],
  });
}
