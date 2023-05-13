import { getExecOutput } from '@actions/exec';

export async function fetchEverything() {
  await getExecOutput('git', ['fetch', '--tags', 'origin']);

  const gitIsShallowRepositoryOutput = await getExecOutput('git', [
    'rev-parse',
    '--is-shallow-repository',
  ]);

  if (gitIsShallowRepositoryOutput.stdout.trim() === 'true') {
    await getExecOutput('git', ['fetch', '--unshallow', 'origin']);
  }
}
