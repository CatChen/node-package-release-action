import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { notice, warning } from '@actions/core';

export const DEFAULT_WORKING_DIRECTORY = process.cwd();

export async function getPackageVersion(
  directory: string,
): Promise<string | null> {
  const absoluteDirectory = resolve(DEFAULT_WORKING_DIRECTORY, directory);
  const packageJsonPath = resolve(absoluteDirectory, 'package.json');
  if (!existsSync(packageJsonPath)) {
    warning(`package.json cannot be found at ${packageJsonPath}`);
    return null;
  }
  notice(`Using package.json from: ${packageJsonPath}`);
  const content = await readFile(packageJsonPath, 'utf-8');
  const { version } = JSON.parse(content) as { version?: string };

  return version != null ? String(version) : null;
}
