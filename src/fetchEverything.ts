import { notice, error, getBooleanInput, ExitCode } from "@actions/core";
import { getExecOutput } from "@actions/exec";

export async function fetchEverything() {
  const gitFetchOutput = await getExecOutput("git", [
    "fetch",
    "--tags",
    "--unshallow",
    "origin",
  ]);
  if (gitFetchOutput.exitCode !== ExitCode.Success) {
    throw new Error(gitFetchOutput.stderr);
  }
}
