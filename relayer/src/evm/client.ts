import { http, createWalletClient, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";

import { evmChain } from "./config/chain";
import { getFromEnvironment } from "../lib/utils";

const privateKey = getFromEnvironment("EVM_PRIVATE_KEY");

export const account = privateKeyToAccount(privateKey as `0x${string}`);

export const client = createWalletClient({
  account,
  chain: evmChain,
  transport: http(),
}).extend(publicActions);
