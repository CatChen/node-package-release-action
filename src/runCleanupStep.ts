import { notice, warning } from '@actions/core';
import { getExecOutput } from '@actions/exec';

export async function runCleanupStep(
  stepName: string,
  command: string,
  args: string[],
): Promise<boolean> {
  notice(`${stepName}: ${command} ${args.join(' ')}`);
  const output = await getExecOutput(command, args, {
    ignoreReturnCode: true,
  });
  if (output.exitCode === 0) {
    notice(`${stepName}: done`);
    return true;
  }

  warning(`${stepName}: failed with exit code ${output.exitCode}`);
  if (output.stdout.trim() !== '') {
    warning(`${stepName} stdout:\n${output.stdout}`);
  }
  if (output.stderr.trim() !== '') {
    warning(`${stepName} stderr:\n${output.stderr}`);
  }
  return false;
}
