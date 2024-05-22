import * as anchor from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import { getFromEnvironment } from "../utils";
import { idl, programId } from ".";

export const secretKey = Uint8Array.from(
  JSON.parse(getFromEnvironment("SOLANA_SECRET_KEY"))
);
export const wallet = new anchor.Wallet(Keypair.fromSecretKey(secretKey));

const cluster = "devnet";
const connection = new Connection(clusterApiUrl(cluster));

export const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: "processed",
});
anchor.setProvider(provider);

export const program = new anchor.Program(idl, programId, provider);
