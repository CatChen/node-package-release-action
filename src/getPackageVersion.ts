import { createRequire } from "module";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { notice } from "@actions/core";

export const DEFAULT_WORKING_DIRECTORY = process.cwd();

export async function getPackageVersion(directory = "./") {
  const absoluteDirectory = resolve(DEFAULT_WORKING_DIRECTORY, directory);
  const require = createRequire(absoluteDirectory);
  const packageJsonPath = resolve(absoluteDirectory, "package.json");
  if (!existsSync(packageJsonPath)) {
    throw new Error(`package.json cannot be found at ${packageJsonPath}`);
  }
  notice(`Using package.json from: ${packageJsonPath}`);
  const { version } = require(packageJsonPath);

  return String(version);
}
