import { promises as fs } from 'fs';
import { dirname, join } from 'path';

let dataunlockerJsonFilePath: string | undefined;
const getEnvFromDataUnlockerFile = async (
  name: string
): Promise<string | undefined> => {
  if (!dataunlockerJsonFilePath) {
    let dir = process.cwd();
    while (
      !(await fs.stat(join(dir, 'package.json')).then(
        () => true,
        () => false
      ))
    ) {
      const parent = dirname(dir);
      if (parent === dir) return; // reached root
      dir = parent;
    }

    dataunlockerJsonFilePath = join(dir, '.dataunlocker.json');
  }

  const data = await fs
    .readFile(dataunlockerJsonFilePath)
    .catch(() => undefined);

  if (!data) {
    return;
  }

  try {
    const json = JSON.parse(data.toString());
    return json[name];
  } catch (e) {
    throw new Error(`Can't parse json from ${dataunlockerJsonFilePath}: ` + e);
  }
};

export const getEnv = async (name: string): Promise<string | undefined> =>
  process.env[name] ??
  process.env[`npm_config_${name.toLowerCase()}`] ??
  (await getEnvFromDataUnlockerFile(name)) ??
  '';
