import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorError } from "@coral-xyz/anchor";
import { OtcMarket } from "../target/types/otc_market";
import * as spl from '@solana/spl-token';
import * as assert from "assert";
import { createMint, createUserAndATA, fundATA, getTokenBalanceWeb3, createPDA } from "./helpers/utils_spl";
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
import * as wormhole from "@certusone/wormhole-sdk/lib/cjs/solana/wormhole";
import { PublicKey, Keypair, Signer, PublicKeyInitData } from "@solana/web3.js";

export const CORE_BRIDGE_PID = new PublicKey(CONTRACTS["TESTNET"].solana.core);
function address_wormhole_format(address: string){
    const addressBuffer = Buffer.from(address, "hex");
    const finalAddress = Buffer.alloc(32);
  
    addressBuffer.copy(finalAddress, 12);
    
  
    return finalAddress;
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


describe("Create offer", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const wallet = provider.wallet as anchor.Wallet;
    const program = anchor.workspace.OtcMarket as Program<OtcMarket>;
  
    let decimals: number,mintAddress: PublicKey, senderATA: PublicKey, escrowWallet: PublicKey, escrowBump: number;
    let target_chain: number, source_chain: number, seller_address: Buffer, target_token_address: Buffer;
    before(async () =>{
        decimals = 18;
      mintAddress = await createMint(provider, decimals);
      senderATA = await createUserAndATA(provider, mintAddress, wallet.payer);
      await fundATA(provider, mintAddress, wallet.payer, senderATA, decimals);
  
      // Create PDA's for escrow_wallet
      [escrowWallet, escrowBump] = await createPDA([Buffer.from("escrow"), mintAddress.toBuffer()], program.programId);
    
      target_chain = 10;
      source_chain = 1;
      seller_address = address_wormhole_format(wallet.publicKey.toString());
      target_token_address = address_wormhole_format("0x7B7789A97B6b931269d95426bb1e328E93F077a4");
    });
    
    it("Should create offer", async () => {
      const source_token_amount = new anchor.BN(10).pow(new anchor.BN(decimals));
      
      const exchange_rate = new anchor.BN(10).pow(new anchor.BN(18));
      
  
      //accounts
      const config = deriveAddress([Buffer.from("config")], program.programId);
      const offerPda = deriveAddress([
        Buffer.from("offer"), 
        wallet.publicKey.toBuffer(),
        new anchor.BN(source_chain).toBuffer("le", 2),
        new anchor.BN(target_chain).toBuffer("le", 2),
        mintAddress.toBuffer(),
    //    Buffer.from(Uint8Array.from(target_token_address)),
    //    new anchor.BN(10).toBuffer("le", 8),
       ], program.programId)
       console.log("offerPda", offerPda.toString());
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
        .createOffer(
          target_chain,
          Array.from(seller_address),
          Array.from(target_token_address),
          source_token_amount,
          exchange_rate,
          decimals
      )
        .accounts({
          seller: wallet.payer.publicKey,
          config: config,
          wormholeProgram: CORE_BRIDGE_PID,
          wormholeBridge: wormholeAccounts.wormholeBridge,
          wormholeFeeCollector: wormholeAccounts.wormholeFeeCollector,
          wormholeEmitter: wormholeAccounts.wormholeEmitter,
          wormholeSequence: wormholeAccounts.wormholeSequence,
          wormholeMessage: wormholeMessage,
          foreignEmitter: deriveForeignEmitterKey(program.programId, target_chain as ChainId),
          sellerAta: senderATA,
          sourceToken: mintAddress,
          escrow: escrowWallet,
          offer: offerPda,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          systemProgram: wormholeAccounts.systemProgram,
          clock: wormholeAccounts.clock,
          rent: wormholeAccounts.rent,
        })
        .rpc();
      console.log(txHash);
    });

    it("Should create offer with another token", async () => {
        mintAddress = await createMint(provider, decimals);
        senderATA = await createUserAndATA(provider, mintAddress, wallet.payer);
        await fundATA(provider, mintAddress, wallet.payer, senderATA, decimals);
    
        // Create PDA's for escrow_wallet
        [escrowWallet, escrowBump] = await createPDA([Buffer.from("escrow"), mintAddress.toBuffer()], program.programId);
        
        
        const source_token_amount = new anchor.BN(10).pow(new anchor.BN(decimals));
    
        const exchange_rate = new anchor.BN(10).pow(new anchor.BN(18));
        
    
        //accounts
        const config = deriveAddress([Buffer.from("config")], program.programId);
        const offerPda = deriveAddress([
          Buffer.from("offer"), 
          wallet.publicKey.toBuffer(),
          new anchor.BN(source_chain).toBuffer("le", 2),
          new anchor.BN(target_chain).toBuffer("le", 2),
          mintAddress.toBuffer(),
      //    Buffer.from(Uint8Array.from(target_token_address)),
      //    new anchor.BN(10).toBuffer("le", 8),
         ], program.programId)
         console.log("offerPda", offerPda.toString());
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
          .createOffer(
            target_chain,
            Array.from(seller_address),
            Array.from(target_token_address),
            source_token_amount,
            exchange_rate,
            decimals
        )
          .accounts({
            seller: wallet.payer.publicKey,
            config: config,
            wormholeProgram: CORE_BRIDGE_PID,
            wormholeBridge: wormholeAccounts.wormholeBridge,
            wormholeFeeCollector: wormholeAccounts.wormholeFeeCollector,
            wormholeEmitter: wormholeAccounts.wormholeEmitter,
            wormholeSequence: wormholeAccounts.wormholeSequence,
            wormholeMessage: wormholeMessage,
            foreignEmitter: deriveForeignEmitterKey(program.programId, target_chain as ChainId),
            sellerAta: senderATA,
            sourceToken: mintAddress,
            escrow: escrowWallet,
            offer: offerPda,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            systemProgram: wormholeAccounts.systemProgram,
            clock: wormholeAccounts.clock,
            rent: wormholeAccounts.rent,
          })
          .rpc();
        console.log(txHash);
      });

    it("Should create another offer with same token", async () => {
        target_chain = 11;
        const source_token_amount = new anchor.BN(10).pow(new anchor.BN(decimals));
        const exchange_rate = (new anchor.BN(10).pow(new anchor.BN(17))).mul(new anchor.BN(5));
        
    
        //accounts
        const config = deriveAddress([Buffer.from("config")], program.programId);
        const offerPda = deriveAddress([
          Buffer.from("offer"), 
          wallet.publicKey.toBuffer(),
          new anchor.BN(source_chain).toBuffer("le", 2),
          new anchor.BN(target_chain).toBuffer("le", 2),
          mintAddress.toBuffer(),
      //    Buffer.from(Uint8Array.from(target_token_address)),
      //    new anchor.BN(10).toBuffer("le", 8),
         ], program.programId)

        console.log("offerPda", offerPda.toString());
    
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
          .createOffer(
            target_chain,
            Array.from(seller_address),
            Array.from(target_token_address),
            source_token_amount,
            exchange_rate,
            decimals
        )
          .accounts({
            seller: wallet.payer.publicKey,
            config: config,
            wormholeProgram: CORE_BRIDGE_PID,
            wormholeBridge: wormholeAccounts.wormholeBridge,
            wormholeFeeCollector: wormholeAccounts.wormholeFeeCollector,
            wormholeEmitter: wormholeAccounts.wormholeEmitter,
            wormholeSequence: wormholeAccounts.wormholeSequence,
            wormholeMessage: wormholeMessage,
            foreignEmitter: deriveForeignEmitterKey(program.programId, target_chain as ChainId),
            sellerAta: senderATA,
            sourceToken: mintAddress,
            escrow: escrowWallet,
            offer: offerPda,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            systemProgram: wormholeAccounts.systemProgram,
            clock: wormholeAccounts.clock,
            rent: wormholeAccounts.rent,
          })
          .rpc();
        console.log(txHash);
      });
  });