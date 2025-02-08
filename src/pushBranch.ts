import { error, notice } from '@actions/core';
import { getExecOutput } from '@actions/exec';

export async function pushBranch(dryRun: boolean): Promise<void> {
  const gitBranchOutput = await getExecOutput('git', [
    'branch',
    '--show-current',
  ]);
  const branchName = gitBranchOutput.stdout;
  if (branchName === '') {
    error(`No branch detected`);
    error(
      `Did you forget to set the ref input in the actions/checkout Action?`,
    );
    throw new Error(`No branch detected`);
  }
  notice(`Current branch: ${branchName}`);

  await getExecOutput('git', [
    'push',
    '--force-with-lease',
    '--follow-tags',
    ...(dryRun ? ['--dry-run'] : []),
  ]);
}
