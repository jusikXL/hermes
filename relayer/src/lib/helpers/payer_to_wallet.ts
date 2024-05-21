import { NodeWallet } from "@certusone/wormhole-sdk/lib/cjs/solana/utils"; // TODO: fix
import { Signer } from "@solana/web3.js";

export default function payerToWallet(payer: Signer) {
  return NodeWallet.fromSecretKey(payer.secretKey);
}
