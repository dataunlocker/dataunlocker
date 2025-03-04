import { getEnv, getRelativeFileToCwd, isFileExists } from '@/utils';
import { createHash } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { basename, dirname, resolve } from 'path';

interface Args {
  /** Filename to patch; resolved from cwd. */
  0?: string;

  id?: string;

  'no-backup'?: boolean;

  backup?: string;

  endpoint?: string;
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

  if (!file.endsWith('.js')) {
    return warnAndExit(
      `Only .js files are supported. Provided file not supported: ${file}`
    );
  }

  const js = (await readFile(file)).toString();
  const id = args.id || getEnv('DATAUNLOCKER_ID');
  const env = getEnv('DATAUNLOCKER_ENV')?.toLowerCase() || '';

  if (!id || !/^[0-9a-f]{24}$/.test(id)) {
    return warnAndExit(
      `Please specify a valid DataUnlocker ID as DATAUNLOCKER_ID env var or --id CLI param. Copy it from the DataUnlocker dashboard.`
    );
  }

  if (args.backup && typeof args.backup !== 'string') {
    return warnAndExit(`Please specify the backup file name`);
  }

  if (args.backup && args['no-backup']) {
    return warnAndExit(`Conflicting options: --backup and --no-backup`);
  }

  const hash = createHash('sha256')
    .update(id)
    .update(basename(file))
    .digest('hex')
    .slice(0, 7);

  const fileBackup = args.backup
    ? resolve(args.backup)
    : args['no-backup']
      ? ''
      : `${file}.${hash}.backup`;
  const isBackupFileExists = fileBackup
    ? await isFileExists(fileBackup)
    : false;
  let jsToPatch = js;

  console.log(
    `Backup file: ${isBackupFileExists ? `exists (${getRelativeFileToCwd(fileBackup)})` : fileBackup ? 'does not exist' : 'disabled'}`
  );

  if (fileBackup && !isBackupFileExists) {
    console.info(
      ` ↳ Backing up ${getRelativeFileToCwd(file)} -> ${getRelativeFileToCwd(fileBackup)}...`
    );

    await mkdir(dirname(fileBackup), { recursive: true });

    await writeFile(fileBackup, jsToPatch);

    console.info(` ✔ Backed up to ${getRelativeFileToCwd(fileBackup)}`);
  }

  console.log(`Patching`);
  if (isBackupFileExists) {
    jsToPatch = (await readFile(fileBackup)).toString();
    console.log(
      ` ↳ Using backup file contents (${getRelativeFileToCwd(fileBackup)})`
    );
  } else {
    console.log(
      ` ↳ Using original file contents (${getRelativeFileToCwd(file)})`
    );
  }

  if (args.endpoint) {
    console.log(` ↳ Using endpoint ${args.endpoint}`);
  } else {
    console.log(` ↳ Using the latest healthy endpoint (automatic)`);
  }

  console.log(` ↳ ${getRelativeFileToCwd(file)} will be overwritten`);
  console.log(` ↳ Patching, please wait...`);

  const url = `https://api${env ? `.${env}` : ''}.dataunlocker.com/domains/${id}/defender/patch-js${args.endpoint ? `?endpoint=${encodeURIComponent(args.endpoint)}` : ''}`;

  let result: Response;
  try {
    result = await fetch(url, {
      method: 'POST',
      body: jsToPatch,
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

  console.log(` ↳ Writing ${getRelativeFileToCwd(file)}...`);

  await writeFile(file, text);

  console.log(` ✔ Done!`);
}

const warnAndExit = (message: string) => {
  console.warn(`❗️ ${message}

Usage:

$ npx dataunlocker patch file.js [--id 000000000000000000000000] [--no-backup] [--backup file.js.backup]`);

  process.exit(1);
};
