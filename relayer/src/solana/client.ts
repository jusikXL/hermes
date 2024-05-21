import * as anchor from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import "dotenv/config";
import { OtcMarket } from "../../target/types/otc_market";
import { getFromEnvironment } from "../lib/utils";

const secretkey = Uint8Array.from(
  JSON.parse(getFromEnvironment("SOLANA_SECRET_KEY"))
);

export const provider = () => {
  let connection = new Connection(clusterApiUrl("devnet"));
  let wallet = new anchor.Wallet(Keypair.fromSecretKey(secretkey));
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "processed",
  });
  //const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.OtcMarket as anchor.Program<OtcMarket>;

  //return {provider, program};
  return { provider, program };
};
