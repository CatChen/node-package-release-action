import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { getExecOutput } from "@actions/exec";
import { getInput } from "@actions/core";

export const DEFAULT_WORKING_DIRECTORY = process.cwd();

export async function setVersion(version: string) {
  const directory = getInput("directory");
  const absoluteDirectory = resolve(DEFAULT_WORKING_DIRECTORY, directory);
  const packageJsonPath = resolve(absoluteDirectory, "package.json");
  if (existsSync(packageJsonPath)) {
    const npmVersionOutput = await getExecOutput("npm", ["version", version]);
    if (npmVersionOutput.exitCode !== 0) {
      throw new Error(npmVersionOutput.stderr);
    }
  } else {
    const gitTagOutput = await getExecOutput("git", ["tag", version]);
    if (gitTagOutput.exitCode !== 0) {
      throw new Error(gitTagOutput.stderr);
    }
  }
}
