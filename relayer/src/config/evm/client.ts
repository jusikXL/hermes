import { http, createWalletClient, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { evmChain } from "../../contants";

export const account = privateKeyToAccount("0x000");

export const client = createWalletClient({
  account,
  chain: evmChain,
  transport: http(),
}).extend(publicActions);
