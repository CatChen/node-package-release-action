import { ExitCode } from "@actions/core";
import { getExecOutput } from "@actions/exec";

export async function fetchEverything() {
  const gitFetchTagsOutput = await getExecOutput("git", [
    "fetch",
    "--tags",
    "origin",
  ]);
  if (gitFetchTagsOutput.exitCode !== ExitCode.Success) {
    throw new Error(gitFetchTagsOutput.stderr);
  }

  const gitFetchUnshallowOutput = await getExecOutput("git", [
    "fetch",
    "--unshallow",
    "origin",
  ]);
  if (gitFetchUnshallowOutput.exitCode !== ExitCode.Success) {
    throw new Error(gitFetchUnshallowOutput.stderr);
  }
}
