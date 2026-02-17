import { describe, expect, it } from 'vitest';

import { parse, verify, verifyAsync } from './index';

describe('htpasswd', () => {
  describe('verify', () => {
    it('should verify bcrypt hashes', () => {
      // Password: "password"
      const hash = '$2b$10$0ilo6bz0qh23ppUl8UWeHuPOT3eC24x9Oh.5o7cJg2EXDxYW9N3Ly';
      expect(verify('password', hash)).toBe(true);
      expect(verify('wrong', hash)).toBe(false);
    });

    it('should verify SHA1 hashes', () => {
      // password: "password"
      const hash = '{SHA}W6ph5Mm5Pz8GgiULbPgzG37mj9g=';
      expect(verify('password', hash)).toBe(true);
      expect(verify('wrong', hash)).toBe(false);
    });

    it('should verify APR1 hashes', () => {
      // password: "password", salt: "Hl8aeGwd"
      const hash = '$apr1$Hl8aeGwd$eu0KXh0r52OnPC/yzIzWF1';
      expect(verify('password', hash)).toBe(true);
      expect(verify('wrong', hash)).toBe(false);
    });

    it('should verify plaintext when unsafe is true', () => {
      expect(verify('password', 'password')).toBe(true);
    });
  });

  describe('verifyAsync', () => {
    it('should verify bcrypt hashes asynchronously', async () => {
      const hash = '$2b$10$0ilo6bz0qh23ppUl8UWeHuPOT3eC24x9Oh.5o7cJg2EXDxYW9N3Ly';
      await expect(verifyAsync('password', hash)).resolves.toBe(true);
      await expect(verifyAsync('wrong', hash)).resolves.toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse valid htpasswd content', () => {
      const content = `
# Comment
user1:{SHA}W6ph5Mm5Pz8GgiULbPgzG37mj9g=
user2:$apr1$salt$hash
`;
      const entries = parse(content);
      expect(entries).toHaveLength(2);
      expect(entries[0]).toEqual({
        username: 'user1',
        hash: '{SHA}W6ph5Mm5Pz8GgiULbPgzG37mj9g=',
        algorithm: 'sha1',
      });
    });

    it('should throw on plaintext without unsafe option', () => {
      const content = 'user:password';
      expect(() => parse(content)).toThrow();
    });

    it('should parse plaintext with unsafe option', () => {
      const content = 'user:password';
      const entries = parse(content, { unsafe: true });
      expect(entries[0].algorithm).toBe('plain');
    });
  });
});
