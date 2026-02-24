import { notice, warning } from '@actions/core';
import { getExecOutput } from '@actions/exec';

export async function updateTag(tag: string): Promise<void> {
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
    return;
  }

  warning(
    `Failed to delete remote tag ${tag} with exit code ${output.exitCode}`,
  );
}
