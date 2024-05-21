import { getFromEnvironment } from "../lib/helpers";

const address = getFromEnvironment("EVM_ADDRESS") as `0x${string}`;

export default address;
