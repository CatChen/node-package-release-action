import { getExecOutput } from '@actions/exec';

export async function configGit(): Promise<void> {
  await getExecOutput('git', ['config', '--global', 'push.default', 'simple']);

  await getExecOutput('git', [
    'config',
    '--global',
    'push.autoSetupRemote',
    'true',
  ]);
}
