import { client, config } from ".";

export default async function deliver(vaaHex: `0x${string}`) {
  return client.writeContract({
    ...config,
    functionName: "receiveMessage",
    args: [vaaHex],
  });
}
