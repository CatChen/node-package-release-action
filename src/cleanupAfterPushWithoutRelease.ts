import type { ReleaseTransactionState } from './ReleaseTransactionState.js';
import { notice, warning } from '@actions/core';
import { logReleaseTransactionManualRemediation } from './logReleaseTransactionManualRemediation.js';
import { runCleanupStep } from './runCleanupStep.js';

export async function cleanupAfterPushWithoutRelease(
  state: ReleaseTransactionState,
): Promise<void> {
  notice(
    'Failure detected after branch push but before GitHub release creation. Attempting rollback.',
  );

  const rollbackResults: boolean[] = [];

  if (state.releaseTag !== null) {
    rollbackResults.push(
      await runCleanupStep(`Delete remote tag ${state.releaseTag}`, 'git', [
        'push',
        '--delete',
        'origin',
        state.releaseTag,
      ]),
    );
  } else {
    warning('Release tag is unavailable. Skipping remote tag deletion.');
  }

  if (state.initialBranchName !== null && state.initialHeadSha !== null) {
    rollbackResults.push(
      await runCleanupStep(
        `Reset remote branch ${state.initialBranchName} to ${state.initialHeadSha}`,
        'git',
        [
          'push',
          '--force-with-lease',
          'origin',
          `${state.initialHeadSha}:refs/heads/${state.initialBranchName}`,
        ],
      ),
    );
  } else {
    warning('Initial branch and HEAD SHA are unavailable. Skipping rollback.');
  }

  if (
    rollbackResults.length === 0 ||
    rollbackResults.some((result) => !result)
  ) {
    warning('Automatic rollback did not fully succeed.');
    logReleaseTransactionManualRemediation(state);
    return;
  }

  notice('Automatic rollback completed successfully.');
}
