import { getFromEnvironment } from "./lib/utils";

export const evmAddress = getFromEnvironment("EVM_ADDRESS");
export const solanaProgramId = getFromEnvironment("SOLANA_PROGRAM_ID");
