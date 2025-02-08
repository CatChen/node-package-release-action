import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getInput, notice } from '@actions/core';
import { getExecOutput } from '@actions/exec';

export const DEFAULT_WORKING_DIRECTORY = process.cwd();

export async function setVersion(
  version: string,
  directory: string,
): Promise<void> {
  const absoluteDirectory = resolve(DEFAULT_WORKING_DIRECTORY, directory);
  const packageJsonPath = resolve(absoluteDirectory, 'package.json');
  if (existsSync(packageJsonPath)) {
    await getExecOutput('npm', ['version', version]);
  } else {
    await getExecOutput('git', ['tag', `v${version}`]);
  }
  notice(`Tag created: v${version}`);
}
