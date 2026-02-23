import { warning } from '@actions/core';
import type { ReleaseTransactionState } from './ReleaseTransactionState.js';

export function logReleaseTransactionManualRemediation(
  state: ReleaseTransactionState,
): void {
  const commands: string[] = [];

  if (state.releaseTag !== null) {
    commands.push(`gh release delete ${state.releaseTag} --yes`);
    commands.push(`git push --delete origin ${state.releaseTag}`);
  }

  if (state.initialBranchName !== null && state.initialHeadSha !== null) {
    commands.push(
      `git push --force-with-lease origin ${state.initialHeadSha}:refs/heads/${state.initialBranchName}`,
    );
  }

  if (commands.length === 0) {
    warning(
      'Manual remediation commands are unavailable because release state is incomplete.',
    );
    return;
  }

  warning(
    [
      'Manual remediation commands (run only if needed):',
      ...commands.map((command) => `  ${command}`),
    ].join('\n'),
  );
}
