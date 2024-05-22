import { getFromEnvironment } from "../utils";

const address = getFromEnvironment("EVM_ADDRESS") as `0x${string}`;

export default address;
