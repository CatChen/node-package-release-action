import type { ReleaseTransactionState } from './ReleaseTransactionState.js';
import { warning } from '@actions/core';

export function cleanupAfterReleaseCreatedFailure(
  state: ReleaseTransactionState,
): void {
  warning(
    `GitHub Release ${state.releaseTag ?? '(unknown tag)'} was already created before failure.` +
      '\nAutomatic rollback is skipped to avoid deleting published artifacts unexpectedly.',
  );
  warning('Shorthand tag update may be incomplete. Update shorthand tags manually if needed.');
}
