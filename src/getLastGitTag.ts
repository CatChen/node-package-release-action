import { getExecOutput } from "@actions/exec";

export async function getLastGitTag() {
  const lastTaggedCommitOutput = await getExecOutput("git", [
    "rev-list",
    "--tags",
    "--max-count=1",
  ]);
  console.log(lastTaggedCommitOutput);
  console.log(JSON.stringify(lastTaggedCommitOutput));
  if (lastTaggedCommitOutput.exitCode !== 0) {
    throw new Error(lastTaggedCommitOutput.stderr);
  }
  const lastTaggedCommit = lastTaggedCommitOutput.stdout;
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
