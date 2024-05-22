import { PublicKey } from "@solana/web3.js";
import { SignedVaa, isBytes, parseVaa } from "@certusone/wormhole-sdk";
import base58 from "bs58";
import solana from "@wormhole-foundation/sdk/platforms/solana";
import {
  Wormhole,
  deserialize,
  loadProtocols,
  signSendWait,
} from "@wormhole-foundation/sdk";
import { secretKey, wallet } from ".";
import { program } from "./client";
import { utils as sdkUtils } from "@wormhole-foundation/sdk-solana";
import { utils as sdkCoreUtils } from "@wormhole-foundation/sdk-solana-core";

export default async function deliver(vaaBytes: SignedVaa) {
  await loadProtocols(solana, ["WormholeCore"]);
  const platform = new solana.Platform("Testnet");
  const chain = platform.getChain("Solana");
  const core = await chain.getWormholeCore();

  const signer = await solana.getSigner(
    await chain.getRpc(),
    base58.encode(secretKey)
  );
  const sender = Wormhole.chainAddress(chain.chain, signer.address());

  console.log(chain.config.chainId);

  const vaa = deserialize("Uint8Array", vaaBytes);

  const publishTxs = core.verifyMessage(sender.address, vaa);
  await signSendWait(chain, publishTxs, signer);

  ////////////////////////////////////////////////////////////////////

  const coreBridge = chain.config.contracts.coreBridge;
  if (!coreBridge) {
    throw new Error("Core address not found");
  }
  const wormholeProgram = new PublicKey(coreBridge);

  const parsed = isBytes(vaaBytes) ? parseVaa(vaaBytes) : vaaBytes;

  // console.log(parsed.hash);

  const config = sdkUtils.deriveAddress(
    [Buffer.from("config")],
    program.programId
  );

  const posted = sdkCoreUtils.derivePostedVaaKey(wormholeProgram, parsed.hash);
  //console.log(posted);

  const foreignEmitter = sdkUtils.deriveAddress(
    [
      Buffer.from("foreign_emitter"),
      (() => {
        const buf = Buffer.alloc(2);
        buf.writeUInt16LE(parsed.emitterChain);
        return buf;
      })(),
    ],
    program.programId
  );

  const received = sdkUtils.deriveAddress(
    [
      Buffer.from("received"),
      (() => {
        const buf = Buffer.alloc(10);
        buf.writeUInt16LE(parsed.emitterChain, 0);
        buf.writeBigInt64LE(parsed.sequence, 2);
        return buf;
      })(),
    ],
    program.programId
  );

  await program.methods
    .receiveMessage([...parsed.hash])
    .accounts({
      payer: wallet.publicKey,
      config: config,
      wormholeProgram: wormholeProgram,
      posted: posted,
      foreignEmitter: foreignEmitter,
      received: received,
    })
    .rpc();
}
