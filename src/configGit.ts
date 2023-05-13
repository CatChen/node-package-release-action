import { exportVariable, getInput } from '@actions/core';
import { getExecOutput } from '@actions/exec';

export const GITHUB_ACTION_USER_NAME = 'GitHub Action';
export const GITHUB_ACTION_USER_EMAIL =
  '41898282+github-actions[bot]@users.noreply.github.com';

export async function configGit() {
  await getExecOutput('git', [
    'config',
    '--global',
    'user.name',
    GITHUB_ACTION_USER_NAME,
  ]);

  await getExecOutput('git', [
    'config',
    '--global',
    'user.email',
    GITHUB_ACTION_USER_EMAIL,
  ]);

  await getExecOutput('git', ['config', '--global', 'push.default', 'simple']);

  await getExecOutput('git', [
    'config',
    '--global',
    'push.autoSetupRemote',
    'true',
  ]);

  const githubToken = getInput('github-token');
  exportVariable('GH_TOKEN', githubToken);

  await getExecOutput('gh', ['auth', 'setup-git']);
}
