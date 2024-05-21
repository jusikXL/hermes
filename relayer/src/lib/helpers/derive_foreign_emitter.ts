import { PublicKey } from "@solana/web3.js";
import { ChainId } from "@certusone/wormhole-sdk";
import { deriveAddress } from "@certusone/wormhole-sdk/lib/cjs/solana";

export default function deriveForeignEmitterKey(
  programId: PublicKey,
  chain: ChainId
) {
  return deriveAddress(
    [
      Buffer.from("foreign_emitter"),
      (() => {
        const buf = Buffer.alloc(2);
        buf.writeUInt16LE(chain);
        return buf;
      })(),
    ],
    programId
  );
}
