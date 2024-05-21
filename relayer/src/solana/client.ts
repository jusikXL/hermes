import * as anchor from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import {cluster, OtcMakerIdl, secretKey, solana_program_id } from "./config/config";


let connection = new Connection(clusterApiUrl(cluster));
let wallet = new anchor.Wallet(Keypair.fromSecretKey(secretKey));

export const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: "processed",
});

anchor.setProvider(provider);

export const program = new anchor.Program(OtcMakerIdl, solana_program_id, provider);


