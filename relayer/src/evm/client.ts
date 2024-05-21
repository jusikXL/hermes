import { http, createWalletClient, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getFromEnvironment } from "../lib/utils";
import { chain } from ".";

const privateKey = getFromEnvironment("EVM_PRIVATE_KEY");
const account = privateKeyToAccount(privateKey as `0x${string}`);

const client = createWalletClient({
  account,
  chain: chain,
  transport: http(),
}).extend(publicActions);

export default client;
