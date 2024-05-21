import { getFromEnvironment } from "../lib/helpers";

const programId = getFromEnvironment("SOLANA_PROGRAM_ID");

export default programId;
