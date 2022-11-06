import { getExecOutput } from "@actions/exec";

export async function pushBranch() {
  const gitPushOutput = await getExecOutput("git", ["push", "--follow-tags"]);
  if (gitPushOutput.exitCode !== 0) {
    throw new Error(gitPushOutput.stderr);
  }
}
