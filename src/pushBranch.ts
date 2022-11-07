import { notice, error, getBooleanInput, ExitCode } from "@actions/core";
import { getExecOutput } from "@actions/exec";

export async function pushBranch() {
  const dryRun = getBooleanInput("dry-run");

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

  const gitPushOutput = await getExecOutput("git", [
    "push",
    "--follow-tags",
    ...(dryRun ? ["--dry-run"] : []),
  ]);
  if (gitPushOutput.exitCode !== ExitCode.Success) {
    throw new Error(gitPushOutput.stderr);
  }
}
