import type { ReleaseTransactionState } from './ReleaseTransactionState.js';
import { notice, warning } from '@actions/core';
import { deleteBranch } from './deleteBranch.js';
import { updateTag } from './updateTag.js';

export async function cleanupAfterPushWithoutRelease(
  state: ReleaseTransactionState,
): Promise<void> {
  notice(
    'Failure detected after branch push but before GitHub release creation. Attempting rollback.',
  );

  let rollbackCompleted = true;

  if (state.releaseTag !== null) {
    if (!(await updateTag(state.releaseTag))) {
      rollbackCompleted = false;
    }
  } else {
    warning('Release tag is unavailable. Skipping remote tag deletion.');
    rollbackCompleted = false;
  }

  if (state.initialBranchName !== null && state.initialHeadSha !== null) {
    if (!(await deleteBranch(state.initialBranchName, state.initialHeadSha))) {
      rollbackCompleted = false;
    }
  } else {
    warning('Initial branch and HEAD SHA are unavailable. Skipping rollback.');
    rollbackCompleted = false;
  }

  if (!rollbackCompleted) {
    warning('Automatic rollback did not fully succeed.');
    return;
  }

  notice('Automatic rollback completed successfully.');
}
