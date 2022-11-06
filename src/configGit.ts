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
}
