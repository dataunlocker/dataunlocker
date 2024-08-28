import { isFileExists } from '@/utils';
import { assert, expect } from 'chai';
import { $, ExecaError } from 'execa';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { beforeEach } from 'mocha';
import { resolve } from 'path';

describe('dataunlocker patch', () => {
  const dir = resolve(process.cwd(), 'local');
  const file = resolve(dir, 'test.js');
  const backupFile = resolve('local/test.js.b80112c.backup');
  const fileContent = 'console.log("test");';

  beforeEach(async () => {
    await rm(backupFile, { force: true });
    await rm(file, { force: true });

    await mkdir(dir, { recursive: true });
    await writeFile(file, fileContent);
  });

  it('patches a file', async () => {
    await $({
      stdio: ['inherit', 'inherit', 'inherit'],
    })`npx -y dataunlocker patch local/test.js`;

    expect(await isFileExists(backupFile)).to.be.true;
    expect((await readFile(backupFile)).toString()).to.be.equal(fileContent);
    expect(await readFile(file)).to.have.length.greaterThanOrEqual(3000);
  });

  it('refuses to patch if invalid ID is given', async () => {
    try {
      await $`npx -y dataunlocker patch local/test.js --id 1234`;
      assert.fail();
    } catch (e) {
      if (!(e instanceof ExecaError)) {
        assert.fail();
      }
      expect(e.exitCode).to.be.equal(1);
      expect(e.stderr).to.include('valid DataUnlocker ID');
    }
  });

  it('refuses to patch if non-existing file is given', async () => {
    try {
      await $`npx -y dataunlocker patch local/test-NO.js`;
      assert.fail();
    } catch (e) {
      if (!(e instanceof ExecaError)) {
        assert.fail();
      }
      expect(e.exitCode).to.be.equal(1);
      expect(e.stderr).to.include('File not found');
    }
  });
});
