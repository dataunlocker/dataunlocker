import { createHash } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { isFileExists } from '../../lib/utils/files.js';

interface Args {
  /** Filename to patch; resolved from cwd. */
  0?: string;

  id?: string;

  'no-backup'?: boolean;

  backup?: string;
}

export default async function patch(args: Args) {
  if (!args[0]) {
    return warnAndExit(`Please provide a file name to patch.`);
  }

  const file = resolve(args[0]);
  const isFile = await isFileExists(file);

  if (!isFile) {
    return warnAndExit(`File not found: ${file}`);
  }

  const js = await readFile(file);
  const id =
    args.id ||
    process.env.DATAUNLOCKER_ID ||
    process.env.npm_config_dataunlocker_id;
  const env = (process.env.DATAUNLOCKER_ENV || '').toLowerCase();

  if (!file.endsWith('.js')) {
    return warnAndExit(
      `Only .js files are supported. Provided file not supported: ${file}`
    );
  }

  if (!id || !/^[0-9a-f]{24}$/.test(id)) {
    return warnAndExit(
      `Please specify a valid DataUnlocker ID as DATAUNLOCKER_ID env var or --id CLI param`
    );
  }

  if (args.backup && typeof args.backup !== 'string') {
    return warnAndExit(`Please specify the backup file name`);
  }

  if (args.backup && args['no-backup']) {
    return warnAndExit(`Conflicting options: --backup and --no-backup`);
  }

  const fileBackup = args.backup
    ? resolve(args.backup)
    : args['no-backup']
      ? ''
      : `${file}.${createHash('sha256').update(js).digest('hex').slice(0, 7)}.backup`;

  if (fileBackup) {
    console.info(`Backing up ${file} -> ${fileBackup}...`);

    if (await isFileExists(file)) {
      console.info(`Overwriting existing backup file ${fileBackup}...`);
    }

    await mkdir(dirname(fileBackup), { recursive: true });

    await writeFile(fileBackup, js);

    console.info(`✔ File backed up, ${file} -> ${fileBackup}`);
  }

  console.log(`Patching ${file}, please wait...`);

  const url = `https://api${env ? `.${env}` : ''}.dataunlocker.com/domains/${id}/defender/patch-js`;

  let result: Response;
  try {
    result = await fetch(url, {
      method: 'POST',
      body: js,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  } catch (e) {
    console.error(`POST ${url} failed, ${e}`);
    process.exit(1002);
  }

  let text = '';
  try {
    text = await result.text();
  } catch (e) {
    console.error(`POST ${url} failed, ${e}`);
    process.exit(1003);
  }

  if (result.status >= 300 || result.status < 200) {
    console.error(
      `POST ${url} failed, status ${result.status} ${result.statusText}\n\n${text}`
    );
    process.exit(1004);
  }

  console.log(`Writing ${file}...`);

  await writeFile(file, text);

  console.log(`✔ Done!`);
}

const warnAndExit = (message: string) => {
  console.warn(`❗️ ${message}

Usage:

$ npx dataunlocker patch file.js [--id 000000000000000000000000] [--no-backup] [--backup file.js.backup]`);

  process.exit(1);
};
