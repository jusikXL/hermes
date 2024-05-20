import { createPublicClient, http } from "viem";
import { evmChain } from "../../contants";

export const publicClient = createPublicClient({
  chain: evmChain,
  transport: http(),
});
