import { ExitCode } from "@actions/core";
import { getExecOutput } from "@actions/exec";
import { valid } from "semver";

export async function getAllGitTags() {
  const tagOutput = await getExecOutput("git", ["tag"]);
  if (tagOutput.exitCode !== ExitCode.Success) {
    throw new Error(tagOutput.stderr);
  }

  const allTags = tagOutput.stdout.split("\n");
  const versionTags = allTags.filter((tag) => valid(tag));
  return versionTags;
}
