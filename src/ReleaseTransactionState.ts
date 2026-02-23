import { getState, saveState, warning } from '@actions/core';
import { getExecOutput } from '@actions/exec';

export const STATE_IS_POST = 'isPost';
const STATE_RELEASE_TRANSACTION = 'releaseTransaction';

export type ReleaseTransactionState = {
  completed: boolean;
  dryRun: boolean;
  initialBranchName: string | null;
  initialHeadSha: string | null;
  releaseTag: string | null;
  pushBranchCompleted: boolean;
  releaseCreated: boolean;
  updateShorthandReleaseRequested: boolean;
  updateShorthandReleaseCompleted: boolean;
};

export function saveReleaseTransactionState(
  state: ReleaseTransactionState,
): void {
  saveState(STATE_RELEASE_TRANSACTION, JSON.stringify(state));
}

export function updateReleaseTransactionState(
  state: ReleaseTransactionState,
  updates: Partial<ReleaseTransactionState>,
): void {
  Object.assign(state, updates);
  saveReleaseTransactionState(state);
}

export function loadReleaseTransactionState(): ReleaseTransactionState | null {
  const stateJson = getState(STATE_RELEASE_TRANSACTION);
  if (stateJson === '') {
    return null;
  }
  try {
    const parsed = JSON.parse(stateJson) as Partial<ReleaseTransactionState>;
    return {
      completed: parsed.completed === true,
      dryRun: parsed.dryRun === true,
      initialBranchName: parsed.initialBranchName ?? null,
      initialHeadSha: parsed.initialHeadSha ?? null,
      releaseTag: parsed.releaseTag ?? null,
      pushBranchCompleted: parsed.pushBranchCompleted === true,
      releaseCreated: parsed.releaseCreated === true,
      updateShorthandReleaseRequested:
        parsed.updateShorthandReleaseRequested === true,
      updateShorthandReleaseCompleted:
        parsed.updateShorthandReleaseCompleted === true,
    };
  } catch (error) {
    warning(`Failed to parse release transaction state: ${String(error)}`);
    return null;
  }
}

async function getCurrentGitContext(): Promise<{
  branchName: string | null;
  headSha: string | null;
}> {
  const branchOutput = await getExecOutput('git', ['branch', '--show-current']);
  const headOutput = await getExecOutput('git', ['rev-parse', 'HEAD']);

  const branchName = branchOutput.stdout.trim();
  const headSha = headOutput.stdout.trim();

  return {
    branchName: branchName === '' ? null : branchName,
    headSha: headSha === '' ? null : headSha,
  };
}

export async function createReleaseTransactionState({
  dryRun,
  updateShorthandReleaseRequested,
}: {
  dryRun: boolean;
  updateShorthandReleaseRequested: boolean;
}): Promise<ReleaseTransactionState> {
  const { branchName, headSha } = await getCurrentGitContext();
  return {
    completed: false,
    dryRun,
    initialBranchName: branchName,
    initialHeadSha: headSha,
    releaseTag: null,
    pushBranchCompleted: false,
    releaseCreated: false,
    updateShorthandReleaseRequested,
    updateShorthandReleaseCompleted: false,
  };
}
