import { getFromEnvironment } from "./lib/utils";

export const evmAddress = getFromEnvironment("EVM_ADDRESS") as `0x${string}`;
export const solanaProgramId = getFromEnvironment("SOLANA_PROGRAM_ID");
