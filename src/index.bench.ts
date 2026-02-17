import { bench, describe } from 'vitest';

import { parse } from './index';

const BIG_FILE = `user1:$apr1$salt$hash\n`.repeat(1000);

describe('Parsing performance', () => {
  bench('@se-oss/htpasswd', () => {
    parse(BIG_FILE, { unsafe: true });
  });
});
