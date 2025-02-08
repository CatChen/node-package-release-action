import { createRequire } from 'module';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { notice, warning } from '@actions/core';

export const DEFAULT_WORKING_DIRECTORY = process.cwd();

export function getPackageVersion(directory: string): string | null {
  const absoluteDirectory = resolve(DEFAULT_WORKING_DIRECTORY, directory);
  const packageJsonPath = resolve(absoluteDirectory, 'package.json');
  if (!existsSync(packageJsonPath)) {
    warning(`package.json cannot be found at ${packageJsonPath}`);
    return null;
  }
  const require = createRequire(absoluteDirectory);
  notice(`Using package.json from: ${packageJsonPath}`);
  const { version } = require(packageJsonPath) as unknown as {
    version: string;
  };

  return String(version);
}
