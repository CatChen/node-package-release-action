import { warning } from "@actions/core";
import { ReleaseType, rsort, gte, diff } from "semver";
import { getAllGitTags } from "./getAllGitTags";

export async function findLastSameReleaseTypeVersion(
  releaseVersion: string,
  releaseType: ReleaseType
) {
  const versionTags = await getAllGitTags();
  if (versionTags.length === 0) {
    warning(`No tag found.`);
    return null;
  }
  const sortedTags = rsort(versionTags);
  let candidateTag = sortedTags.shift();
  while (
    candidateTag !== undefined &&
    (gte(candidateTag, releaseVersion) ||
      diff(candidateTag, releaseVersion) !== releaseType)
  ) {
    candidateTag = sortedTags.shift();
  }
  if (candidateTag === undefined) {
    warning(`No tag found.`);
    return null;
  }
  return candidateTag;
}
