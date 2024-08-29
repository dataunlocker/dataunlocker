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
  const backupFile2 = resolve('local/test-manual.js.backup');
  const fileContent = 'console.log("test");';

  beforeEach(async () => {
    await rm(backupFile, { force: true });
    await rm(file, { force: true });
    await rm(backupFile2, { force: true });

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

  it("won't backup a file with --no-backup option", async () => {
    await $({
      stdio: ['inherit', 'inherit', 'inherit'],
    })`npx -y dataunlocker patch local/test.js --no-backup`;

    expect(await isFileExists(backupFile)).to.be.false;
    expect(await readFile(file)).to.have.length.greaterThanOrEqual(3000);
  });

  it('backups a file to a selected location if given', async () => {
    await new Promise((r) => setTimeout(r, 10000)); // API rate limit cut
    await $({
      stdio: ['inherit', 'inherit', 'inherit'],
    })`npx -y dataunlocker patch local/test.js --backup ${backupFile2}`;

    expect(await isFileExists(backupFile2)).to.be.true;
    expect(await isFileExists(backupFile)).to.be.false;
    expect((await readFile(backupFile2)).toString()).to.be.equal(fileContent);
    expect(await readFile(file)).to.have.length.greaterThanOrEqual(3000);
  });
});
