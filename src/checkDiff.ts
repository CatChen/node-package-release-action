import { join } from 'node:path';
import { ExitCode, debug, getInput } from '@actions/core';
import { getExecOutput } from '@actions/exec';
import { sync } from 'glob';

export async function checkDiff(tag: string) {
  const directory = getInput('directory');
  const diffTargets = getInput('diff-targets');
  const diffOutput = await getExecOutput('git', [
    'diff',
    tag,
    '--name-only',
    '--',
    ...sync(join(directory, diffTargets)),
  ]);
  if (diffOutput.exitCode !== ExitCode.Success) {
    throw new Error(diffOutput.stderr);
  }
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
