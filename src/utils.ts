import { safeCompare } from '@se-oss/timing-safe-compare';

import type { Algorithm } from './typings';

/**
 * Detects the algorithm used for a given hash.
 *
 * @param hash The hash to detect the algorithm for.
 * @returns The detected algorithm.
 */
export function detectAlgorithm(hash: string): Algorithm {
  if (hash.startsWith('$2y$') || hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return 'bcrypt';
  }

  if (hash.startsWith('$apr1$')) {
    return 'md5';
  }

  if (hash.startsWith('{SHA}')) {
    return 'sha1';
  }

  // Standard DES crypt hashes are 13 characters long.
  if (hash.length === 13) {
    return 'crypt';
  }

  return 'plain';
}

/**
 * Converts a byte array to a Base64 string.
 *
 * @param bytes The byte array to convert.
 * @returns The Base64 string.
 */
export function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  return btoa(String.fromCharCode(...bytes));
}

export { safeCompare };
