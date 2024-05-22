import { utils as sdkUtils } from "@wormhole-foundation/sdk-solana";
import { utils as sdkCoreUtils } from "@wormhole-foundation/sdk-solana-core";

import { PublicKeyInitData, PublicKey } from "@solana/web3.js";

export function deriveConfig(programId: PublicKeyInitData) {
  return sdkUtils.deriveAddress([Buffer.from("config")], programId);
}

export function derivePosted(
  wormholeProgramId: PublicKeyInitData,
  hash: Buffer
): PublicKey {
  return sdkCoreUtils.derivePostedVaaKey(wormholeProgramId, hash);
}

export function deriveForeignEmitter(
  programId: PublicKeyInitData,
  emitterChain: number
): PublicKey {
  return sdkUtils.deriveAddress(
    [
      Buffer.from("foreign_emitter"),
      (() => {
        const buf = Buffer.alloc(2);
        buf.writeUInt16LE(emitterChain);
        return buf;
      })(),
    ],
    programId
  );
}

export function deriveReceived(
  programId: PublicKeyInitData,
  emitterChain: number,
  sequence: bigint
): PublicKey {
  return sdkUtils.deriveAddress(
    [
      Buffer.from("received"),
      (() => {
        const buf = Buffer.alloc(10);
        buf.writeUInt16LE(emitterChain, 0);
        buf.writeBigInt64LE(sequence, 2);
        return buf;
      })(),
    ],
    programId
  );
}
