import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import {
  CONTRACTS,
  isBytes,
  parseVaa,
  SignedVaa,
  postVaaSolana,
  ChainId,
} from "@certusone/wormhole-sdk";
import * as wormhole from "@certusone/wormhole-sdk/lib/cjs/solana/wormhole";
import { deriveAddress } from "@certusone/wormhole-sdk/lib/cjs/solana";
import * as anchor from "@coral-xyz/anchor";
import {
  deriveForeignEmitterKey,
  deriveReceivedKey,
  payerToWallet,
} from "../lib/helpers";
import { program, provider, wallet } from ".";

export const CORE_BRIDGE_PID = new PublicKey(CONTRACTS["TESTNET"].solana.core);

export default async function deliver(vaaBytes: SignedVaa) {
  // ctx.logger.warn("VAA with hash:", getHashFromBuffer(Buffer.from(vaa)));

  await postVaa(vaaBytes, wallet.payer.secretKey, provider.connection);
  await sendVaa(vaaBytes, program, wallet.payer.publicKey);

  // try {
  //   const post_txHash = await postVaa(
  //     vaaBytes,
  //     wallet.payer.secretKey,
  //     provider.connection
  //   );
  //   console.log("VAA posted, tx:", post_txHash);
  // } catch (e) {
  //   console.log("Error posting VAA");
  //   ctx.logger.error(e);
  // }

  // const register = await registerEmitter(vaa, wallet.publicKey, program);
  // console.log('Emitter registered, tx:', register);

  // try {
  //   const send_txHash = await sendVaa(vaa, program, wallet.payer.publicKey);
  //   console.log("VAA sent, tx:", send_txHash);
  // } catch (e) {
  //   console.log("Error sending VAA");
  //   ctx.logger.error(e);
  // }
}

async function postVaa(
  vaa: SignedVaa,
  secretKey: Uint8Array,
  connection: Connection
) {
  console.log("Post VAA");
  const PAYER_KEYPAIR = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  const wallet_2 = payerToWallet(PAYER_KEYPAIR);

  const txHash = await postVaaSolana(
    connection,
    wallet_2.signTransaction,
    CORE_BRIDGE_PID,
    wallet_2.key(),
    Buffer.from(vaa)
  );
  return txHash;
}

// async function registerEmitter(vaa: SignedVaa, owner: PublicKey, program: anchor.Program<OtcMarket>) {

//     const parsed = isBytes(vaa) ? parseVaa(vaa) : vaa;

//     const chain = parsed.emitterChain;
//     const emitterAddress = parsed.emitterAddress;

//     // const address = "Fc642eEDBb585ee8667e0256FaFeD6ce73939a0f";
//     // const addressBuffer = Buffer.from(address, "hex");
//     // const emitterAddress = Buffer.alloc(32);

//     // addressBuffer.copy(emitterAddress, 12);

//     console.log(emitterAddress);
//     console.log(chain);

//     const config = deriveAddress([Buffer.from("config")], program.programId);
//     const foreignEmitter = deriveForeignEmitterKey(program.programId, chain as ChainId);

//     const txHash = await program.methods
//       .registerEmitter(chain, [...emitterAddress])
//       .accounts({
//         owner,
//         config,
//         foreignEmitter,
//       })
//       .rpc();
//     return txHash;
// }

async function sendVaa(
  vaa: SignedVaa,
  program: anchor.Program<anchor.Idl>,
  payer: PublicKey
) {
  const config = deriveAddress([Buffer.from("config")], program.programId);

  const parsed = isBytes(vaa) ? parseVaa(vaa) : vaa;

  const txHash = await program.methods
    .receiveMessage([...parsed.hash])
    .accounts({
      payer: payer,
      config: config,
      wormholeProgram: CORE_BRIDGE_PID,
      posted: wormhole.derivePostedVaaKey(CORE_BRIDGE_PID, parsed.hash),
      foreignEmitter: deriveForeignEmitterKey(
        program.programId,
        parsed.emitterChain as ChainId
      ),
      received: deriveReceivedKey(
        program.programId,
        parsed.emitterChain as ChainId,
        parsed.sequence
      ),
    })
    .rpc();
  return txHash;
}
