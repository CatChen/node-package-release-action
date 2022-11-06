import { getExecOutput } from "@actions/exec";

export async function setVersion(version: string) {
  const npmVersionOutput = await getExecOutput("npm", ["version", version]);
  if (npmVersionOutput.exitCode !== 0) {
    throw new Error(npmVersionOutput.stderr);
  }
}
