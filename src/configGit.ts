import { getInput, exportVariable } from "@actions/core";
import { getExecOutput } from "@actions/exec";

export const GITHUB_ACTION_USER_NAME = "GitHub Action";
export const GITHUB_ACTION_USER_EMAIL =
  "41898282+github-actions[bot]@users.noreply.github.com";

export async function configGit() {
  const gitConfigNameOutput = await getExecOutput("git", [
    "config",
    "--global",
    "user.name",
    GITHUB_ACTION_USER_NAME,
  ]);
  if (gitConfigNameOutput.exitCode !== 0) {
    throw new Error(gitConfigNameOutput.stderr);
  }

  const gitConfigEmailOutput = await getExecOutput("git", [
    "config",
    "--global",
    "user.email",
    GITHUB_ACTION_USER_EMAIL,
  ]);
  if (gitConfigEmailOutput.exitCode !== 0) {
    throw new Error(gitConfigEmailOutput.stderr);
  }

  const gitConfigPushDefaultOutput = await getExecOutput("git", [
    "config",
    "--global",
    "push.default",
    "simple",
  ]);
  if (gitConfigPushDefaultOutput.exitCode !== 0) {
    throw new Error(gitConfigPushDefaultOutput.stderr);
  }

  const gitConfigPushAutoSetupRemoteOutput = await getExecOutput("git", [
    "config",
    "--global",
    "push.autoSetupRemote",
    "true",
  ]);
  if (gitConfigPushAutoSetupRemoteOutput.exitCode !== 0) {
    throw new Error(gitConfigPushAutoSetupRemoteOutput.stderr);
  }

  const githubToken = getInput("github-token");
  exportVariable("GH_TOKEN", githubToken);

  const ghAuthOutput = await getExecOutput("gh", ["auth", "setup-git"]);
  if (ghAuthOutput.exitCode !== 0) {
    throw new Error(ghAuthOutput.stderr);
  }
}
