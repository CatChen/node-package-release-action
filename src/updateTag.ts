import { notice, warning } from '@actions/core';
import { getExecOutput } from '@actions/exec';

export async function updateTag(tag: string): Promise<boolean> {
  notice(`Delete remote tag: ${tag}`);
  const output = await getExecOutput(
    'git',
    ['push', '--delete', 'origin', tag],
    {
      ignoreReturnCode: true,
    },
  );

  if (output.exitCode === 0) {
    notice(`Tag deleted: ${tag}`);
    return true;
  }

  warning(
    `Failed to delete remote tag ${tag} with exit code ${output.exitCode}`,
  );
  if (output.stdout.trim() !== '') {
    warning(`Delete tag stdout:\n${output.stdout}`);
  }
  if (output.stderr.trim() !== '') {
    warning(`Delete tag stderr:\n${output.stderr}`);
  }
  warning(`Manual cleanup command: git push --delete origin ${tag}`);
  return false;
}
