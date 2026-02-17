import { verifyApr1 } from '@se-oss/apr1';
import bcrypt from 'bcryptjs';

import { verifySha1 } from './sha1';
import type { HtpasswdEntry, ParseOptions } from './typings';
import { detectAlgorithm, safeCompare } from './utils';

/**
 * Verifies a password against a hash.
 *
 * @param password The plaintext password.
 * @param hash The hash to verify against.
 * @returns True if the password matches the hash.
 */
export function verify(password: string, hash: string): boolean {
  const algo = detectAlgorithm(hash);

  switch (algo) {
    case 'bcrypt':
      return bcrypt.compareSync(password, hash);
    case 'md5':
      return verifyApr1(password, hash);
    case 'sha1':
      return verifySha1(password, hash);
    case 'plain':
      return safeCompare(password, hash);
    case 'crypt':
      throw new Error('Algorithm "crypt" is insecure and not supported.');
    default:
      throw new Error(`Unsupported algorithm: ${algo}`);
  }
}

/**
 * Verifies a password against a hash asynchronously.
 *
 * @param password The plaintext password.
 * @param hash The hash to verify against.
 * @returns A promise that resolves to true if the password matches the hash.
 */
export async function verifyAsync(password: string, hash: string): Promise<boolean> {
  const algo = detectAlgorithm(hash);

  switch (algo) {
    case 'bcrypt':
      return bcrypt.compare(password, hash);
    case 'md5':
      return verifyApr1(password, hash);
    case 'sha1':
      return verifySha1(password, hash);
    case 'plain':
      return safeCompare(password, hash);
    case 'crypt':
      throw new Error('Algorithm "crypt" is insecure and not supported.');
    default:
      throw new Error(`Unsupported algorithm: ${algo}`);
  }
}

/**
 * Parses an htpasswd content string.
 *
 * @param content The htpasswd file content.
 * @param options Parsing options.
 * @returns An array of htpasswd entries.
 */
export function parse(content: string, options: ParseOptions = {}): HtpasswdEntry[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => {
      const [username, ...rest] = line.split(':');
      const hash = rest.join(':');
      const algorithm = detectAlgorithm(hash);

      if (algorithm === 'plain' && !options.unsafe) {
        throw new Error(
          `Plaintext password detected for user "${username}". Use options.unsafe to allow this.`
        );
      }

      return { username, hash, algorithm };
    });
}

/**
 * Stringifies an array of htpasswd entries.
 *
 * @param entries The htpasswd entries to stringify.
 * @returns The stringified htpasswd content.
 */
export function stringify(entries: HtpasswdEntry[]): string {
  return entries.map((entry) => `${entry.username}:${entry.hash}`).join('\n');
}
