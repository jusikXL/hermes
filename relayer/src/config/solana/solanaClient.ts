import * as anchor from "@coral-xyz/anchor";
import {clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import { OtcMarket } from "../../../target/types/otc_market";

const secret_key = Uint8Array.from([]);
   

export const provider = () => {
    let connection = new Connection(clusterApiUrl("devnet"));
    let wallet = new anchor.Wallet(Keypair.fromSecretKey(secret_key));
    const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "processed",
    });
    //const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.OtcMarket as anchor.Program<OtcMarket>;

    //return {provider, program};
    return {provider, program};
}


