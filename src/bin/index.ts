#!/usr/bin/env node

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

console.log(`🛡️ DataUnlocker CLI v${pkg.version}\n`);

try {
  const f = await import(`./${argv[0]}/index.js`);
  f.default(parseArgs(argv.slice(1)));
} catch (e) {
  console.error(`Please supply a valid command.
    
Examples:
  • npx dataunlocker patch file.js`);
  process.exit(1);
}
