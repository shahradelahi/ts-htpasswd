import { sha1 } from '@se-oss/sha1';

import { bytesToBase64, safeCompare } from './utils';

/**
 * Verifies a password against a SHA1 hash.
 *
 * @param password The plaintext password.
 * @param hash The {SHA} prefixed hash.
 * @returns True if the password matches the hash.
 */
export function verifySha1(password: string, hash: string): boolean {
  return safeCompare(generateSha1(password), hash);
}

/**
 * Generates a SHA1 hash for a password.
 *
 * @param password The plaintext password.
 * @returns The {SHA} prefixed hash.
 */
export function generateSha1(password: string): string {
  const digest = sha1(password);
  const b64 = bytesToBase64(digest);
  return `{SHA}${b64}`;
}
