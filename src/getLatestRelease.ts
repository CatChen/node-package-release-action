import { warning } from "@actions/core";
import type { Octokit } from "@octokit/core";
import type { Api } from "@octokit/plugin-rest-endpoint-methods/dist-types/types";
import { RequestError } from "@octokit/request-error";

export async function getLatestRelease(
  owner: string,
  repo: string,
  octokit: Octokit & Api
) {
  try {
    const latestReleaseResponse = await octokit.rest.repos.getLatestRelease({
      owner,
      repo,
    });
    // Latest release doesn't include pre-release.
    const latestRelease = latestReleaseResponse.data;
    return latestRelease.tag_name;
  } catch (error) {
    if (error instanceof RequestError) {
      if (error.status === 404) {
        warning(`Latest release not found but pre-release may exist`);
        const releasesResponse = await octokit.rest.repos.listReleases({
          owner,
          repo,
        });
        if (releasesResponse.data.length === 0) {
          // No release or pre-release available.
          warning(`Pre-release not found`);
          return null;
        }
        const latestRelease = releasesResponse.data[0];
        return latestRelease.tag_name;
      }
    }
  }
  return null;
}
