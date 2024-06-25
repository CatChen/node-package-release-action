import type { Octokit } from '@octokit/core';
import type { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types';
import { exportVariable, getInput } from '@actions/core';
import { getExecOutput } from '@actions/exec';

export const GITHUB_ACTION_USER_NAME = 'GitHub Action';
export const GITHUB_ACTION_USER_EMAIL =
  '41898282+github-actions[bot]@users.noreply.github.com';

export async function configGit(octokit: Octokit & Api) {
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
  await getExecOutput('gh', ['auth', 'status']);

  const {
    viewer: { login },
  }: { viewer: { login: string } } = await octokit.graphql(
    `
      query {
        viewer {
          login
        }
      }
    `,
    {},
  );

  const remoteOutput = await getExecOutput('git', [
    'remote',
    'get-url',
    'origin',
  ]);
  const remoteUrl = remoteOutput.stdout.trim();

  const remoteUrlWithToken = remoteUrl.replace(
    /https:\/\//,
    `https://${login}:${githubToken}@`,
  );
  await getExecOutput('git', [
    'remote',
    'set-url',
    'origin',
    remoteUrlWithToken,
  ]);
}
