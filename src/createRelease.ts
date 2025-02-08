import type { Octokit } from '@octokit/core';
import type { components } from '@octokit/openapi-types/types.js';
import type { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types';
import { info, notice } from '@actions/core';

export async function createRelease(
  owner: string,
  repo: string,
  version: string,
  prerelease: boolean,
  dryRun: boolean,
  octokit: Octokit & Api,
): Promise<components['schemas']['release'] | undefined> {
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

  const releasesResponse = await octokit.rest.repos.createRelease({
    owner,
    repo,
    tag_name: `v${version}`,
    name: `v${version}`,
    generate_release_notes: true,
    prerelease,
  });
  notice(`GitHub Release created: ${releasesResponse.data.html_url}`);

  return releasesResponse.data;
}
