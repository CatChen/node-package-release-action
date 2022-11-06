import { notice, getBooleanInput } from "@actions/core";
import { getExecOutput } from "@actions/exec";

export async function pushBranch() {
  const gitBranchOutput = await getExecOutput("git", [
    "branch",
    "--show-current",
  ]);
  if (gitBranchOutput.exitCode !== 0) {
    throw new Error(gitBranchOutput.stderr);
  }
  const branchName = gitBranchOutput.stdout;
  notice(`Current branch: ${branchName}`);

  const dryRun = getBooleanInput("dry-run");
  if (dryRun) {
    notice("Push is skipped in dry run.");
    return;
  }

  const gitPushOutput = await getExecOutput("git", [
    "push",
    "-f",
    "--set-upstream",
    "origin",
    branchName,
    "--follow-tags",
  ]);
  if (gitPushOutput.exitCode !== 0) {
    throw new Error(gitPushOutput.stderr);
  }
}
