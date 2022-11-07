import { notice, error, getBooleanInput, ExitCode } from "@actions/core";
import { getExecOutput } from "@actions/exec";

export async function pushBranch() {
  const gitFetchOutput = await getExecOutput("git", [
    "fetch",
    "--unshallow",
    "origin",
  ]);
  if (gitFetchOutput.exitCode !== ExitCode.Success) {
    throw new Error(gitFetchOutput.stderr);
  }

  await getExecOutput("git", ["status"]);
  await getExecOutput("git", ["log", "--oneline"]);
  await getExecOutput("git", ["branch"]);
  await getExecOutput("git", ["ls-remote"]);

  const gitBranchOutput = await getExecOutput("git", [
    "branch",
    "--show-current",
  ]);
  if (gitBranchOutput.exitCode !== ExitCode.Success) {
    throw new Error(gitBranchOutput.stderr);
  }
  const branchName = gitBranchOutput.stdout;
  if (branchName === "") {
    error(`No branch detected`);
    error(
      `Did you forget to set the ref input in the actions/checkout Action?`
    );
    throw new Error(`No branch detected`);
  }
  notice(`Current branch: ${branchName}`);

  const dryRun = getBooleanInput("dry-run");
  if (dryRun) {
    notice("Push is skipped in dry run");
    return;
  }

  const gitPushOutput = await getExecOutput("git", [
    "push",
    "-f",
    "--set-upstream",
    "origin",
    `HEAD:refs/heads/${branchName}`,
    "--follow-tags",
  ]);
  if (gitPushOutput.exitCode !== ExitCode.Success) {
    throw new Error(gitPushOutput.stderr);
  }
}
