import { client, config } from ".";
import { DeliveryContext } from "../middleware";

export default async function deliver(ctx: DeliveryContext) {
  const vaaBytes = ctx.vaa!.bytes; // vaa presence was checked in controller
  const vaaHex: `0x${string}` = `0x${Buffer.from(vaaBytes).toString("hex")}`;

  client.writeContract({
    ...config,
    functionName: "receiveMessage",
    args: [vaaHex],
  });
}
