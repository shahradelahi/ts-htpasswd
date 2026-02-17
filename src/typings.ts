export type Algorithm = 'bcrypt' | 'md5' | 'sha1' | 'crypt' | 'plain';

export interface HtpasswdEntry {
  username: string;
  hash: string;
  algorithm: Algorithm;
}

export interface ParseOptions {
  /**
   * Allow parsing plaintext passwords.
   * @default false
   */
  unsafe?: boolean;
}
