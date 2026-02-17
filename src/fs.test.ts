import { existsSync } from 'node:fs';
import { readFile, rm } from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { addUser, addUserAsync, authenticate, authenticateAsync, removeUser } from './fs';

const TEST_FILE = './test.htpasswd';

describe('fs', () => {
  beforeEach(async () => {
    if (existsSync(TEST_FILE)) {
      await rm(TEST_FILE);
    }
  });

  afterEach(async () => {
    if (existsSync(TEST_FILE)) {
      await rm(TEST_FILE);
    }
  });

  describe('addUser and addUserAsync', () => {
    it('should add a user to a new file', async () => {
      await addUser(TEST_FILE, 'user1', 'pass1', 'plain');
      const content = await readFile(TEST_FILE, 'utf-8');
      expect(content.trim()).toBe('user1:pass1');
    });

    it('should add a user to a new file asynchronously', async () => {
      await addUserAsync(TEST_FILE, 'user1', 'pass1', 'plain');
      const content = await readFile(TEST_FILE, 'utf-8');
      expect(content.trim()).toBe('user1:pass1');
    });

    it('should update an existing user', async () => {
      await addUser(TEST_FILE, 'user1', 'pass1', 'plain');
      await addUser(TEST_FILE, 'user1', 'pass2', 'plain');
      const content = await readFile(TEST_FILE, 'utf-8');
      expect(content.trim()).toBe('user1:pass2');
    });

    it('should add multiple users', async () => {
      await addUser(TEST_FILE, 'user1', 'pass1', 'plain');
      await addUser(TEST_FILE, 'user2', 'pass2', 'plain');
      const content = await readFile(TEST_FILE, 'utf-8');
      expect(content.trim()).toBe(`user1:pass1\nuser2:pass2`);
    });
  });

  describe('authenticate and authenticateAsync', () => {
    it('should authenticate a user', async () => {
      await addUser(TEST_FILE, 'user1', 'pass1', 'plain');
      expect(await authenticate(TEST_FILE, 'user1', 'pass1')).toBe(true);
      expect(await authenticate(TEST_FILE, 'user1', 'wrong')).toBe(false);
      expect(await authenticate(TEST_FILE, 'unknown', 'pass1')).toBe(false);
    });

    it('should authenticate a user asynchronously', async () => {
      await addUser(TEST_FILE, 'user1', 'pass1', 'plain');
      expect(await authenticateAsync(TEST_FILE, 'user1', 'pass1')).toBe(true);
      expect(await authenticateAsync(TEST_FILE, 'user1', 'wrong')).toBe(false);
    });
  });

  describe('removeUser', () => {
    it('should remove a user', async () => {
      await addUser(TEST_FILE, 'user1', 'pass1', 'plain');
      await addUser(TEST_FILE, 'user2', 'pass2', 'plain');
      await removeUser(TEST_FILE, 'user1');
      const content = await readFile(TEST_FILE, 'utf-8');
      expect(content.trim()).toBe('user2:pass2');
    });
  });
});
