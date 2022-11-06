import type { Octokit } from "@octokit/core";
import type { Api } from "@octokit/plugin-rest-endpoint-methods/dist-types/types";

export async function getLatestRelease(
  owner: string,
  repo: string,
  octokit: Octokit & Api
) {
  const latestReleaseResponse = await octokit.rest.repos.getLatestRelease({
    owner,
    repo,
  });
  if (latestReleaseResponse.status === 200) {
    // Latest release doesn't include pre-release.
    const latestRelease = latestReleaseResponse.data;
    return latestRelease.tag_name;
  }

  const releasesResponse = await octokit.rest.repos.listReleases({
    owner,
    repo,
  });
  if (releasesResponse.data.length === 0) {
    // No release or pre-release available.
    return null;
  }
  const latestRelease = releasesResponse.data[0];
  return latestRelease.tag_name;
}
