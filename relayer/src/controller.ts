import { Connection, PublicKey, Keypair, Signer, PublicKeyInitData } from "@solana/web3.js";
import {
    CONTRACTS,
    isBytes,
    ParsedVaa,
    parseVaa,
    SignedVaa,
    postVaaSolana,
    ChainId
  } from "@certusone/wormhole-sdk";

import * as wormhole from "@certusone/wormhole-sdk/lib/cjs/solana/wormhole";


import { createHash } from 'crypto';
import { StandardRelayerContext } from "@wormhole-foundation/relayer-engine";

import { NodeWallet, deriveAddress} from "@certusone/wormhole-sdk/lib/cjs/solana";

import { OtcMarket } from "../target/types/otc_market";

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";

export const CORE_BRIDGE_PID = new PublicKey(CONTRACTS["TESTNET"].solana.core);




function getHashFromBuffer(buffer: Buffer, algorithm: string = 'sha256'): string {
    // Create a hash object
    const hash = createHash(algorithm);
    
    // Update the hash with the buffer data
    hash.update(buffer);
    
    // Finalize the hash and get the result as a hexadecimal string
    return hash.digest('hex');
  }

export function deriveReceivedKey(
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

export function deriveForeignEmitterKey(programId: PublicKey, chain: ChainId) {
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


const payerToWallet = (payer: Signer) =>
    NodeWallet.fromSecretKey(payer.secretKey);

export async function transferVaa(ctx: StandardRelayerContext) {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const wallet = provider.wallet as anchor.Wallet;
    const program = anchor.workspace.OtcMarket as Program<OtcMarket>;
    const vaa = ctx.vaaBytes;
    if (!isBytes(vaa)) {
        throw new Error("Invalid VAA");
    }
    ctx.logger.warn("VAA with hash:", getHashFromBuffer(Buffer.from(vaa)));
    const post_txHash = await postVaa(vaa, wallet.payer.secretKey, provider.connection);
    console.log('VAA posted, tx:', post_txHash);

    // const register = await registerEmitter(vaa, wallet.publicKey, program);
    // console.log('Emitter registered, tx:', register);

    const send_txHash = await sendVaa(vaa, program, wallet.payer.publicKey);
    console.log('VAA sent, tx:', send_txHash);
}

async function postVaa(vaa: SignedVaa, secretKey: Uint8Array, connection: Connection) {
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

async function sendVaa(vaa: SignedVaa, program: anchor.Program<OtcMarket>, payer: PublicKey){
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