import * as anchor from "@coral-xyz/anchor";
import { readFileSync } from "fs";
import { resolve } from "path";

const idl: anchor.Idl = JSON.parse(
  readFileSync(resolve(__dirname, "./otc_market.json"), "utf-8")
);

export default idl;
