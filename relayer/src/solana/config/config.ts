import * as anchor from "@coral-xyz/anchor";
import { readFileSync } from "fs";
import { resolve } from "path";
import { getFromEnvironment } from "../../lib/utils";

export const secretKey = Uint8Array.from(
  JSON.parse(getFromEnvironment("SOLANA_SECRET_KEY"))
);
export const solana_program_id = new anchor.web3.PublicKey(
  getFromEnvironment("SOLANA_PROGRAM_ID")
);
export const OtcMakerIdl: anchor.Idl = JSON.parse(
  readFileSync(resolve(__dirname, "./otc_market.json"), "utf-8")
);
export const cluster = "devnet";
