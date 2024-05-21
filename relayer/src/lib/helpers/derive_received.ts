import { PublicKey } from "@solana/web3.js";
import { ChainId } from "@certusone/wormhole-sdk";
import { deriveAddress } from "@certusone/wormhole-sdk/lib/cjs/solana";

export default function deriveReceivedKey(
  programId: PublicKey,
  chain: ChainId,
  sequence: bigint
) {
  return deriveAddress(
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
