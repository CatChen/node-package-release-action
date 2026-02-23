import type { ReleaseTransactionState } from './ReleaseTransactionState.js';
import { warning } from '@actions/core';
import { logReleaseTransactionManualRemediation } from './logReleaseTransactionManualRemediation.js';

export function cleanupAfterReleaseCreatedFailure(
  state: ReleaseTransactionState,
): void {
  warning(
    `GitHub Release ${state.releaseTag ?? '(unknown tag)'} was already created before failure.` +
      '\nAutomatic rollback is skipped to avoid deleting published artifacts unexpectedly.',
  );

  if (
    state.updateShorthandReleaseRequested &&
    !state.updateShorthandReleaseCompleted
  ) {
    warning(
      'Shorthand tag update may be incomplete. Re-running this workflow can reconcile shorthand tags.',
    );
  }

  logReleaseTransactionManualRemediation(state);
}
