import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { OtcMarket } from "../target/types/otc_market";

//import { PublicKey } from "@metaplex-foundation/js";
import { PublicKey, Keypair, Signer, PublicKeyInitData } from "@solana/web3.js";
import * as wormhole from "@certusone/wormhole-sdk/lib/cjs/solana/wormhole";
import {
  NodeWallet,
  SignTransaction,
  deriveAddress,
  getPostMessageCpiAccounts,
} from "@certusone/wormhole-sdk/lib/cjs/solana";
import {
  ChainContracts,
  ChainId,
  CONTRACTS,
  isBytes,
  ParsedVaa,
  parseVaa,
  SignedVaa,
  postVaaSolana,
} from "@certusone/wormhole-sdk";
import { Wallet } from "ethers";

import { createHash } from "crypto";

const fs = require("fs").promises;

export const CORE_BRIDGE_PID = new PublicKey(CONTRACTS["TESTNET"].solana.core);

function getHashFromBuffer(
  buffer: Buffer,
  algorithm: string = "sha256"
): string {
  // Create a hash object
  const hash = createHash(algorithm);

  // Update the hash with the buffer data
  hash.update(buffer);

  // Finalize the hash and get the result as a hexadecimal string
  return hash.digest("hex");
}

async function readVaaFromFile(filename: string) {
  try {
    const data = await fs.readFile(filename);
    console.log(data); // This logs the buffer
    console.log(getHashFromBuffer(data));

    return data; // Return the buffer
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export function deriveWormholeMessageKey(
  programId: PublicKeyInitData,
  sequence: bigint
) {
  return deriveAddress(
    [
      Buffer.from("sent"),
      (() => {
        const buf = Buffer.alloc(8);
        buf.writeBigUInt64LE(sequence);
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

const payerToWallet = (payer: Signer) =>
  NodeWallet.fromSecretKey(payer.secretKey);

describe("hello", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.OtcMarket as Program<OtcMarket>;

  it("should initialize", async () => {
    console.log("Program ID", program.programId);
    const wormholeAccounts = getPostMessageCpiAccounts(
      program.programId,
      CORE_BRIDGE_PID,
      wallet.publicKey,
      deriveAddress([Buffer.from("alive")], program.programId)
    );

    const realInitializeAccounts = {
      owner: wallet.publicKey,
      config: deriveAddress([Buffer.from("config")], program.programId),
      wormholeProgram: CORE_BRIDGE_PID,
      ...wormholeAccounts,
      wormholeMessage: deriveWormholeMessageKey(program.programId, 1n),
    };
    const txHash = await program.methods
      .initialize()
      .accounts({
        ...realInitializeAccounts,
      })
      .rpc();
    console.log(txHash);
  });

  it("should send concurrent message", async function () {
    const message = Buffer.from("All your base are belong to us");

    const sequence =
      (
        await wormhole.getProgramSequenceTracker(
          program.provider.connection,
          program.programId,
          CORE_BRIDGE_PID
        )
      ).value() + 1n;
    const wormholeMessage = deriveWormholeMessageKey(
      program.programId,
      sequence
    );

    const wormholeAccounts = getPostMessageCpiAccounts(
      program.programId,
      CORE_BRIDGE_PID,
      wallet.payer.publicKey,
      wormholeMessage
    );

    const txHash = await program.methods
      .sendMessage(message)
      .accounts({
        config: deriveAddress([Buffer.from("config")], program.programId),
        wormholeProgram: CORE_BRIDGE_PID,
        ...wormholeAccounts,
      })
      .rpc();

    console.log(txHash);
  });

  it("should register foreign emitter", async function () {
    const chain = 10;

    const address = "Fc642eEDBb585ee8667e0256FaFeD6ce73939a0f";
    const addressBuffer = Buffer.from(address, "hex");
    const emitterAddress = Buffer.alloc(32);

    addressBuffer.copy(emitterAddress, 12);

    console.log(emitterAddress);

    const owner = wallet.publicKey;
    const config = deriveAddress([Buffer.from("config")], program.programId);
    const foreignEmitter = deriveForeignEmitterKey(program.programId, chain);

    const txHash = await program.methods
      .registerEmitter(chain, [...emitterAddress])
      .accounts({
        owner,
        config,
        foreignEmitter,
      })
      .rpc();

    console.log(txHash);
  });

  it("should post vaa", async function () {
    const signedVaa = (await readVaaFromFile("tests/VAA")) as SignedVaa;

    const secretKey = wallet.payer.secretKey;
    const PAYER_KEYPAIR = Keypair.fromSecretKey(Uint8Array.from(secretKey));
    const wallet_2 = payerToWallet(PAYER_KEYPAIR);
    await postVaaSolana(
      provider.connection,
      wallet_2.signTransaction,
      CORE_BRIDGE_PID,
      wallet_2.key(),
      Buffer.from(signedVaa)
    );
  });

  it("should receive vaa", async function () {
    const config = deriveAddress([Buffer.from("config")], program.programId);

    const VAA = (await readVaaFromFile("tests/VAA")) as SignedVaa;

    const parsed = isBytes(VAA) ? parseVaa(VAA) : VAA;

    const txHash = await program.methods
      .receiveMessage([...parsed.hash])
      .accounts({
        payer: wallet.payer.publicKey,
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

    console.log(txHash);
  });
});
