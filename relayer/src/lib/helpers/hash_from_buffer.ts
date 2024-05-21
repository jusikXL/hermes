import { createHash } from "crypto";

export default function getHashFromBuffer(
  buffer: Buffer,
  algorithm: string = "sha256"
): string {
  // Create a hash object
  const hash = createHash(algorithm);

  // Update the hash with the buffer data
  hash.update(buffer);

  // Finalize the hash and get the result as a hexadecimal string
  return hash.digest("hex");
}
