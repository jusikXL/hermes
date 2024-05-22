import { PublicKey } from "@solana/web3.js";
import { ChainId } from "@wormhole-foundation/sdk";
import sdk from "@wormhole-foundation/sdk-solana";

export default function deriveReceivedKey(
  programId: PublicKey,
  chain: ChainId,
  sequence: bigint
) {
  return sdk.utils.deriveAddress(
    [
      Buffer.from("received"),
      (() => {
        const buf = Buffer.alloc(10);
        buf.writeUInt16LE(chain, 0);
        buf.writeBigInt64LE(sequence, 2);
        return buf;
      })(),
    ],
    programId
  );
}
