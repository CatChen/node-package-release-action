import { notice, warning } from '@actions/core';
import { getExecOutput } from '@actions/exec';

export async function resetBranch(
  branchName: string,
  initialHeadSha: string,
): Promise<void> {
  notice(`Reset remote branch ${branchName} to ${initialHeadSha}`);
  const output = await getExecOutput(
    'git',
    [
      'push',
      '--force',
      'origin',
      `${initialHeadSha}:refs/heads/${branchName}`,
    ],
    {
      ignoreReturnCode: true,
    },
  );

  if (output.exitCode === 0) {
    notice(`Remote branch ${branchName} reset to ${initialHeadSha}`);
    return;
  }

  warning(
    `Failed to reset remote branch ${branchName} with exit code ${output.exitCode}`,
  );
}
