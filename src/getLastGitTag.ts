import { warning, ExitCode } from "@actions/core";
import { getExecOutput } from "@actions/exec";

export async function getLastGitTag() {
  const lastTaggedCommitOutput = await getExecOutput("git", [
    "rev-list",
    "--tags",
    "--max-count=1",
  ]);
  if (lastTaggedCommitOutput.exitCode !== ExitCode.Success) {
    throw new Error(lastTaggedCommitOutput.stderr);
  }
  const lastTaggedCommit = lastTaggedCommitOutput.stdout;

  if (lastTaggedCommit === "") {
    // There is no tag at all.
    warning(`Tag not found.`);
    return null;
  }

  const gitFetchOutput = await getExecOutput("git", [
    "fetch",
    "--tags",
    "origin",
  ]);
  if (gitFetchOutput.exitCode !== ExitCode.Success) {
    throw new Error(gitFetchOutput.stderr);
  }

  const lastTagOutput = await getExecOutput("git", [
    "describe",
    "--tags",
    lastTaggedCommit,
  ]);
  if (lastTaggedCommitOutput.exitCode !== ExitCode.Success) {
    throw new Error(lastTagOutput.stderr);
  }
  const lastTag = lastTagOutput.stdout;
  return lastTag;
}
