# DataUnlocker's CLI

🛡️ [DataUnlocker](https://dataunlocker.com)'s command line interface utilities.

## Requirements

Requires [NodeJS v16+](https://nodejs.org/) to be installed, which comes with `npx` CLI runner.

## Usage

### Patch a core JavaScript file of your web application

[DataUnlocker Defender](https://docs.dataunlocker.com/setup/defender) tightly integrates with your web app's JavaScript code, specifically, your build artifacts or JavaScript libraries that your web app relies on.

Locate such a file (`file.js`) and patch it using the following command, ideally in your deployment pipeline.

```sh
npx -y dataunlocker patch file.js
```

This command requires you to input your unique DataUnlocker domain ID, either by env var `DATAUNLOCKER_ID`:

```sh
export DATAUNLOCKER_ID=000000000000000000000000
```

or via the `--id` flag:

```sh
npx -y dataunlocker patch file.js --id 000000000000000000000000
```

As a result, `file.js` will be replaced with its obfuscated version with DataUnlocker Defender baked in. A backup
of the original `file.js` will be placed next to it, named `file.js.0000000.backup` by default.

- You can skip creating a backup file with `--no-backup` option.
- You can set a name for a backup file with `--backup filename.js` option.
- You can specify which endpoint to use for the patched code with `--endpoint example.com/abcdef` option (specify the endpoint URI without the protocol).
