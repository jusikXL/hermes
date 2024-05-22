import { PublicKey } from "@solana/web3.js";
import { isBytes, parseVaa } from "@certusone/wormhole-sdk";
import { Wormhole, deserialize, signSendWait } from "@wormhole-foundation/sdk";
import { program } from "./client";
import {
  deriveConfig,
  derivePosted,
  deriveForeignEmitter,
  deriveReceived,
} from "../utils";
import { DeliveryContext } from "../middleware";

export default async function deliver(ctx: DeliveryContext): Promise<void> {
  // 1. Verify VAA.
  const signer = ctx.solanaSigner;
  const chain = ctx.solanaPlatform.getChain("Solana");
  const core = ctx.solanaCoreBridge;
  const signedVaa = ctx.vaa!.bytes; // vaa presence was checked in controller

  const sender = Wormhole.chainAddress(chain.chain, signer.address());
  const vaa = deserialize("Uint8Array", signedVaa);

  const publishTxs = core.verifyMessage(sender.address, vaa);

  await signSendWait(chain, publishTxs, signer);

  // 2. Receive VAA.
  const wormholeProgram = new PublicKey(chain.config.contracts.coreBridge!);
  const parsedVaa = isBytes(signedVaa) ? parseVaa(signedVaa) : signedVaa;

  const config = deriveConfig(program.programId);
  const posted = derivePosted(wormholeProgram, parsedVaa.hash);
  const foreignEmitter = deriveForeignEmitter(
    program.programId,
    parsedVaa.emitterChain
  );
  const received = deriveReceived(
    program.programId,
    parsedVaa.emitterChain,
    parsedVaa.sequence
  );

  await program.methods
    .receiveMessage([...parsedVaa.hash])
    .accounts({
      payer: new PublicKey(signer.address()),
      config: config,
      wormholeProgram: wormholeProgram,
      posted: posted,
      foreignEmitter: foreignEmitter,
      received: received,
    })
    .rpc();
}
