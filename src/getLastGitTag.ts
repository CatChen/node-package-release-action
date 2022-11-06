import { warning } from "@actions/core";
import { getExecOutput } from "@actions/exec";

export async function getLastGitTag() {
  const lastTaggedCommitOutput = await getExecOutput("git", [
    "rev-list",
    "--tags",
    "--max-count=1",
  ]);
  if (lastTaggedCommitOutput.exitCode !== 0) {
    throw new Error(lastTaggedCommitOutput.stderr);
  }
  const lastTaggedCommit = lastTaggedCommitOutput.stdout;

  if (lastTaggedCommit === "") {
    // There is no tag at all.
    warning(`Tag not found.`);
    return null;
  }

  const lastTagOutput = await getExecOutput("git", [
    "describe",
    "--tags",
    lastTaggedCommit,
  ]);
  if (lastTaggedCommitOutput.exitCode !== 0) {
    throw new Error(lastTagOutput.stderr);
  }
  const lastTag = lastTagOutput.stdout;
  return lastTag;
}
