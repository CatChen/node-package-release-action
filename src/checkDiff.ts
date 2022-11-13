import { debug, ExitCode } from "@actions/core";
import { getExecOutput } from "@actions/exec";

export async function checkDiff(tag: string) {
  const diffOutput = await getExecOutput("git", ["diff", " --name-only", tag]);
  if (diffOutput.exitCode !== ExitCode.Success) {
    throw new Error(diffOutput.stderr);
  }
  debug(
    `Diff against ${tag}:` +
      "\n" +
      diffOutput.stdout
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n")
  );
  return diffOutput.stdout.split("\n").join("") !== "";
}
