import type { ReleaseTransactionState } from './ReleaseTransactionState.js';
import { notice, warning } from '@actions/core';
import { resetBranch } from './resetBranch.js';
import { updateTag } from './updateTag.js';

export async function cleanupAfterPushWithoutRelease(
  state: ReleaseTransactionState,
): Promise<void> {
  notice(
    'Failure detected after branch push but before GitHub release creation. Attempting rollback.',
  );

  if (state.releaseTag !== null) {
    await updateTag(state.releaseTag);
  } else {
    warning('Release tag is unavailable. Skipping remote tag deletion.');
  }

  if (state.initialBranchName !== null && state.initialHeadSha !== null) {
    await resetBranch(state.initialBranchName, state.initialHeadSha);
  } else {
    warning('Initial branch and HEAD SHA are unavailable. Skipping rollback.');
  }

  notice('Best-effort rollback finished.');
}
