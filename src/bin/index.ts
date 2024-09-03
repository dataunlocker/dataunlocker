#!/usr/bin/env node

import { getEnv } from '@/utils';
import { readFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from '../lib/utils/cli.js';

const argv = process.argv.slice(2);
const pkg = JSON.parse(
  (
    await readFile(
      resolve(dirname(fileURLToPath(import.meta.url)), '../../package.json')
    )
  ).toString()
);

const props = [
  ['ENV', getEnv('DATAUNLOCKER_ENV')],
  ['ID', getEnv('DATAUNLOCKER_ID') || '<not set>'],
]
  .filter(([, v]) => typeof v !== 'undefined')
  .map(([k, v]) => `${k}=${v}`)
  .join(', ');

console.info(
  `💜 DataUnlocker CLI v${pkg.version}${props ? `\n🔧 ${props}` : ''}\n`
);

try {
  const f = await import(`./${argv[0]}/index.js`);
  f.default(parseArgs(argv.slice(1)));
} catch (e) {
  console.error(`Please supply a valid command.
    
Examples:
  • npx dataunlocker patch file.js`);
  process.exit(1);
}
