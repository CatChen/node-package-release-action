import { getState, saveState, warning } from '@actions/core';
import { getExecOutput } from '@actions/exec';

export const IS_POST = 'isPost';
const RELEASE_TRANSACTION = 'releaseTransaction';

export type ReleaseTransactionState = {
  completed: boolean;
  dryRun: boolean;
  initialBranchName: string | null;
  initialHeadSha: string | null;
  releaseTag: string | null;
  pushBranchCompleted: boolean;
  releaseCreated: boolean;
  updateShorthandReleaseCompleted: boolean;
};

function persistReleaseTransactionState(
  state: ReleaseTransactionState,
): void {
  saveState(RELEASE_TRANSACTION, JSON.stringify(state));
}

export async function saveReleaseTransactionState({
  dryRun,
  updateShorthandRelease,
}: {
  dryRun: boolean;
  updateShorthandRelease: boolean;
}): Promise<ReleaseTransactionState> {
  const { branchName, headSha } = await getCurrentGitContext();
  const state: ReleaseTransactionState = {
    completed: false,
    dryRun,
    initialBranchName: branchName,
    initialHeadSha: headSha,
    releaseTag: null,
    pushBranchCompleted: false,
    releaseCreated: false,
    updateShorthandReleaseCompleted: !updateShorthandRelease,
  };
  persistReleaseTransactionState(state);
  return state;
}

export function updateReleaseTransactionState(
  state: ReleaseTransactionState,
  updates: Partial<ReleaseTransactionState>,
): void {
  Object.assign(state, updates);
  persistReleaseTransactionState(state);
}

export function loadReleaseTransactionState(): ReleaseTransactionState | null {
  const stateJson = getState(RELEASE_TRANSACTION);
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
