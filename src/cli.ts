#!/usr/bin/env node
/* eslint-disable no-console */
import * as readline from 'node:readline';
import { Writable } from 'node:stream';
import * as tty from 'node:tty';
import { parseArgs } from 'node:util';

import { addUserAsync } from './fs';
import { Algorithm } from './typings';

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      create: { type: 'boolean', short: 'c' },
      batch: { type: 'boolean', short: 'b' },
      bcrypt: { type: 'boolean', short: 'B' },
      md5: { type: 'boolean', short: 'm' },
      sha: { type: 'boolean', short: 's' },
      plain: { type: 'boolean', short: 'p' },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
  });

  if (values.help || positionals.length < 2) {
    console.log(`
Usage: htpasswd [options] [file] [username]
       htpasswd -b [options] [file] [username] [password]

Options:
  -c, --create    Create a new file.
  -b, --batch     Use batch mode (read password from command line).
  -B, --bcrypt    Use bcrypt encryption (default).
  -m, --md5       Use MD5 encryption.
  -s, --sha       Use SHA encryption.
  -p, --plain     Use plaintext.
  -h, --help      Show this help message.
`);
    return;
  }

  const [file, username] = positionals;
  let password = positionals[2];

  if (!password) {
    if (values.batch) {
      console.error('Error: Password is required in batch mode.');
      process.exit(1);
    }

    if (!tty.isatty(process.stdin.fd)) {
      console.error('Error: Password input requires a terminal.');
      process.exit(1);
    }

    password = await getHiddenPassword('New password: ');
    const confirm = await getHiddenPassword('Re-type new password: ');
    if (password !== confirm) {
      console.error("Error: Passwords don't match.");
      process.exit(1);
    }
  }

  let algorithm: Algorithm = 'bcrypt';
  if (values.md5) algorithm = 'md5';
  else if (values.sha) algorithm = 'sha1';
  else if (values.plain) algorithm = 'plain';

  try {
    await addUserAsync(file, username, password, algorithm);
    console.log(`User ${username} ${values.create ? 'created' : 'updated'} successfully.`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

class MutableStream extends Writable {
  public muted = false;

  override _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    if (!this.muted) {
      process.stdout.write(chunk, encoding);
    }
    callback();
  }
}

function getHiddenPassword(query: string): Promise<string> {
  const mutableStdout = new MutableStream();

  const rl = readline.createInterface({
    input: process.stdin,
    output: mutableStdout,
    terminal: true,
  });

  return new Promise((resolve) => {
    rl.question(query, (password) => {
      process.stdout.write('\n');
      rl.close();
      resolve(password);
    });
    mutableStdout.muted = true;
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
