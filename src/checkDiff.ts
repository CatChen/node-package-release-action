import { join } from 'node:path';
import { ExitCode, debug, getInput } from '@actions/core';
import { getExecOutput } from '@actions/exec';
import { create } from '@actions/glob';

export async function checkDiff(tag: string) {
  const directory = getInput('directory');
  const diffTargets = getInput('diff-targets');
  const globber = await create(join(directory, diffTargets));
  const glob = await globber.glob();
  const diffOutput = await getExecOutput('git', [
    'diff',
    tag,
    '--name-only',
    '--',
    ...glob,
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
