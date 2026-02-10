import type { Octokit } from '@octokit/core';
import type { Api } from '@octokit/plugin-rest-endpoint-methods';
import { debug, warning } from '@actions/core';
import { RequestError } from '@octokit/request-error';
import { rsort, valid } from 'semver';

export async function getLatestReleaseTag(
  owner: string,
  repo: string,
  octokit: Octokit & Api,
) {
  try {
    const latestReleaseResponse = await octokit.rest.repos.getLatestRelease({
      owner,
      repo,
    });
    // Latest release doesn't include pre-release.
    const latestRelease = latestReleaseResponse.data;
    if (valid(latestRelease.tag_name) !== null) {
      return latestRelease.tag_name;
    } else {
      warning(
        `Latest release tag is not a valid semver: ${latestRelease.tag_name}`,
      );
    }
  } catch (error) {
    if (error instanceof RequestError) {
      if (error.status === 404) {
        warning(`Latest release not found but pre-release may exist`);
      } else {
        throw new Error(
          `Unexpected error: [${error.status}] ${error.message}`,
          {
            cause: error,
          },
        );
      }
    } else {
      throw error;
    }
  }
  const releasesResponse = await octokit.rest.repos.listReleases({
    owner,
    repo,
  });
  if (releasesResponse.data.length === 0) {
    warning(`No release found`);
    return null;
  }
  const releaseTags = releasesResponse.data.map((release) => release.tag_name);
  const validReleaseTags = releaseTags.filter((tag) => valid(tag) !== null);
  if (validReleaseTags.length === 0) {
    warning(`No valid release tag found`);
    debug('Release tags:\n' + releaseTags.map((tag) => `  ${tag}`).join('\n'));
    return null;
  }

  const sortedReleaseTags = rsort(validReleaseTags);
  return sortedReleaseTags[0];
}
