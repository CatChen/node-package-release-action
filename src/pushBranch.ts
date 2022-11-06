import { notice, getBooleanInput } from "@actions/core";
import { getExecOutput } from "@actions/exec";

export async function pushBranch() {
  const dryRun = getBooleanInput("dry-run");
  if (dryRun) {
    notice("Push is skipped in dry run.");
  }

  const gitPushOutput = await getExecOutput("git", ["push", "--follow-tags"]);
  if (gitPushOutput.exitCode !== 0) {
    throw new Error(gitPushOutput.stderr);
  }
}
