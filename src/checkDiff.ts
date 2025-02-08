import { join } from 'node:path';
import { debug } from '@actions/core';
import { getExecOutput } from '@actions/exec';
import { globSync } from 'glob';

export async function checkDiff(
  tag: string,
  directory: string,
  diffTargets: string,
): Promise<boolean> {
  const diffOutput = await getExecOutput('git', [
    'diff',
    tag,
    '--name-only',
    '--',
    ...globSync(join(directory, diffTargets)),
  ]);
  debug(
    `Diff against ${tag}:` +
      '\n' +
      diffOutput.stdout
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n'),
  );
  return diffOutput.stdout.split('\n').join('') !== '';
}
