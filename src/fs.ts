import { readFile, rename, writeFile } from 'node:fs/promises';
import { generateApr1 } from '@se-oss/apr1';
import bcrypt from 'bcryptjs';

import { parse, stringify, verify, verifyAsync } from './index';
import { generateSha1 } from './sha1';
import type { Algorithm, HtpasswdEntry } from './typings';

async function readEntries(filepath: string, handleEnoent = false): Promise<HtpasswdEntry[]> {
  try {
    const content = await readFile(filepath, 'utf-8');
    return parse(content, { unsafe: true });
  } catch (error) {
    if (handleEnoent && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeAtomic(filepath: string, content: string): Promise<void> {
  const tempPath = `${filepath}.${Math.random().toString(36).slice(2)}.tmp`;
  await writeFile(tempPath, content);
  await rename(tempPath, filepath);
}

async function updateAndSave(
  filepath: string,
  username: string,
  hash: string,
  algorithm: Algorithm
): Promise<void> {
  const entries = await readEntries(filepath, true);
  const existingIndex = entries.findIndex((e) => e.username === username);

  if (existingIndex !== -1) {
    entries[existingIndex].hash = hash;
    entries[existingIndex].algorithm = algorithm;
  } else {
    entries.push({ username, hash, algorithm });
  }

  await writeAtomic(filepath, stringify(entries) + '\n');
}

/**
 * Authenticates a user against an htpasswd file.
 *
 * @param filepath Path to the htpasswd file.
 * @param username Username to authenticate.
 * @param password Password to authenticate.
 * @returns True if authentication succeeds.
 */
export async function authenticate(
  filepath: string,
  username: string,
  password: string
): Promise<boolean> {
  const entries = await readEntries(filepath);
  const entry = entries.find((e) => e.username === username);

  if (!entry) {
    return false;
  }

  return verify(password, entry.hash);
}

/**
 * Authenticates a user against an htpasswd file asynchronously.
 *
 * @param filepath Path to the htpasswd file.
 * @param username Username to authenticate.
 * @param password Password to authenticate.
 * @returns True if authentication succeeds.
 */
export async function authenticateAsync(
  filepath: string,
  username: string,
  password: string
): Promise<boolean> {
  const entries = await readEntries(filepath);
  const entry = entries.find((e) => e.username === username);

  if (!entry) {
    return false;
  }

  return verifyAsync(password, entry.hash);
}

/**
 * Adds or updates a user in an htpasswd file.
 *
 * @param filepath Path to the htpasswd file.
 * @param username Username to add or update.
 * @param password Password for the user.
 * @param algorithm Hashing algorithm to use.
 */
export async function addUser(
  filepath: string,
  username: string,
  password: string,
  algorithm: Algorithm = 'bcrypt'
): Promise<void> {
  let hash: string;
  switch (algorithm) {
    case 'bcrypt':
      hash = bcrypt.hashSync(password, 10);
      break;
    case 'md5':
      hash = generateApr1(password);
      break;
    case 'sha1':
      hash = generateSha1(password);
      break;
    case 'plain':
      hash = password;
      break;
    default:
      throw new Error(`Unsupported algorithm for generation: ${algorithm}`);
  }

  await updateAndSave(filepath, username, hash, algorithm);
}

/**
 * Adds or updates a user in an htpasswd file asynchronously.
 *
 * @param filepath Path to the htpasswd file.
 * @param username Username to add or update.
 * @param password Password for the user.
 * @param algorithm Hashing algorithm to use.
 */
export async function addUserAsync(
  filepath: string,
  username: string,
  password: string,
  algorithm: Algorithm = 'bcrypt'
): Promise<void> {
  let hash: string;
  switch (algorithm) {
    case 'bcrypt':
      hash = await bcrypt.hash(password, 10);
      break;
    case 'md5':
      hash = generateApr1(password);
      break;
    case 'sha1':
      hash = generateSha1(password);
      break;
    case 'plain':
      hash = password;
      break;
    default:
      throw new Error(`Unsupported algorithm for generation: ${algorithm}`);
  }

  await updateAndSave(filepath, username, hash, algorithm);
}

/**
 * Removes a user from an htpasswd file.
 *
 * @param filepath Path to the htpasswd file.
 * @param username Username to remove.
 */
export async function removeUser(filepath: string, username: string): Promise<void> {
  const entries = await readEntries(filepath);
  const newEntries = entries.filter((e) => e.username !== username);

  await writeAtomic(filepath, stringify(newEntries) + '\n');
}
