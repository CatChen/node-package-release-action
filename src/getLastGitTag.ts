import { warning, ExitCode } from "@actions/core";
import { getExecOutput } from "@actions/exec";
import { rsort } from "semver";

export async function getLastGitTag() {
  const tagOutput = await getExecOutput("git", ["tag"]);
  if (tagOutput.exitCode !== ExitCode.Success) {
    throw new Error(tagOutput.stderr);
  }

  const allTags = tagOutput.stdout.split("\n");
  const versionTags = allTags.filter((tag) =>
    /v\d+\.\d+\.\d+(\-\d+)?/.test(tag)
  );
  const sortedTags = rsort(versionTags);
  if (sortedTags.length === 0) {
    warning(`No tag found.`);
    return null;
  }
  const lastTag = sortedTags[0];
  return lastTag;
}
