import type { Octokit } from '@octokit/core';
import type { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types';
import { getBooleanInput, info, notice } from '@actions/core';

export async function createRelease(
  owner: string,
  repo: string,
  version: string,
  octokit: Octokit & Api,
) {
  const dryRun = getBooleanInput('dry-run');
  if (dryRun) {
    notice('Release creation is skipped in dry run');
    const response = await octokit.rest.repos.generateReleaseNotes({
      owner,
      repo,
      tag_name: `v${version}`,
      name: `v${version}`,
    });
    info(`Release name: ${response.data.name}`);
    info('Release body:\n' + response.data.body + '\n\n');
    return;
  }

  await octokit.rest.repos.createRelease({
    owner,
    repo,
    tag_name: `v${version}`,
    name: `v${version}`,
    generate_release_notes: true,
    prerelease: getBooleanInput('prerelease'),
  });
}
