import { promises as fs } from 'fs';
import { isAbsolute, relative } from 'path';

export async function isFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Returns a filename relative to CWD given the full file path, otherwise returns the original string.
 */
export const getRelativeFileToCwd = (fullFilePath: string): string => {
  const cwd = process.cwd();
  const relativePath = relative(cwd, fullFilePath);

  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    return fullFilePath;
  }

  return relativePath;
};
