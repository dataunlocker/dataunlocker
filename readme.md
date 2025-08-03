# DataUnlocker's CLI

🛡️ [DataUnlocker](https://dataunlocker.com)'s command line interface, helping you to protect your web application and web analytics from ad blockers.

## Requirements

Requires [NodeJS v16+](https://nodejs.org/) to be installed, which comes with `npx` CLI runner.

## Usage

### `$ npx -y dataunlocker patch`

Patches a core JavaScript file of your web application.

[DataUnlocker Defender](https://docs.dataunlocker.com/setup/defender) tightly integrates with your web app's JavaScript code, specifically, your build artifacts or JavaScript libraries that your web app relies on. By design, each `dataunlocker patch` run should be embedded into your build pipeline to generate the newly obfuscated JavaScript file on every build run.

Follow these steps to install DataUnlocker Defender in your web app:

1. Get your DataUnlocker ID from [DataUnlocker Admin](https://admin-2.dataunlocker.com).
2. Locate a core file (for example, `file.js`) which is loaded on all pages of your web application.
3. Patch it using the following command, ideally in your deployment pipeline.

```sh
npx -y dataunlocker patch file.js
```

This command requires you to input your unique DataUnlocker domain ID, either by env var `DATAUNLOCKER_ID`:

```sh
export DATAUNLOCKER_ID=000000000000000000000000
```

or from `.dataunlocker.json` file:

```json
{
  "DATAUNLOCKER_ID": "000000000000000000000000"
}
```

or via the `--id` flag:

```sh
npx -y dataunlocker patch file.js --id 000000000000000000000000
```

As a result, `file.js` will be replaced with its obfuscated version with DataUnlocker Defender baked in. A backup of the original `file.js` will be placed next to it, named `file.js.backup` by default.

Note:

- You can skip creating a backup file with `--no-backup` option.
- You can set a name for a backup file with `--backup filename.js` option.
- You can specify which endpoint to use for the patched code with `--endpoint example.com/abcdef` option (specify the endpoint URI without the protocol).
- If the backup file exists, its content will be used for patching.

## Example

`$ npx -y dataunlocker patch file.js --id 000000000000000000000000`

```
💜 DataUnlocker CLI v2.0.1
🔧 ID=000000000000000000000000

Backup file: does not exist
 ↳ Backing up local/test.js -> local/test.js.c12fcf3.backup...
 ✔ Backed up to local/test.js.c12fcf3.backup
Patching
 ↳ Using original file contents (local/test.js)
 ↳ Using the latest healthy endpoint (automatic)
 ↳ local/test.js will be overwritten
 ↳ Patching, please wait...
 ↳ Writing local/test.js...
 ✔ Done!
```
