import { notice, warning } from '@actions/core';
import { getExecOutput } from '@actions/exec';

export async function deleteBranch(
  branchName: string,
  initialHeadSha: string,
): Promise<boolean> {
  notice(`Reset remote branch ${branchName} to ${initialHeadSha}`);
  const output = await getExecOutput(
    'git',
    [
      'push',
      '--force-with-lease',
      'origin',
      `${initialHeadSha}:refs/heads/${branchName}`,
    ],
    {
      ignoreReturnCode: true,
    },
  );

  if (output.exitCode === 0) {
    notice(`Remote branch ${branchName} reset to ${initialHeadSha}`);
    return true;
  }

  warning(
    `Failed to reset remote branch ${branchName} with exit code ${output.exitCode}`,
  );
  if (output.stdout.trim() !== '') {
    warning(`Reset branch stdout:\n${output.stdout}`);
  }
  if (output.stderr.trim() !== '') {
    warning(`Reset branch stderr:\n${output.stderr}`);
  }
  warning(
    `Manual cleanup command: git push --force-with-lease origin ${initialHeadSha}:refs/heads/${branchName}`,
  );
  return false;
}
