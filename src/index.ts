import type { Release } from '@octokit/webhooks-types';
import {
  endGroup,
  getBooleanInput,
  getInput,
  getState,
  notice,
  saveState,
  setFailed,
  setOutput,
  startGroup,
  warning,
} from '@actions/core';
import { getExecOutput } from '@actions/exec';
import { context } from '@actions/github';
import { configGitWithToken } from 'config-git-with-token-action';
import { type ReleaseType, inc, rsort } from 'semver';
import { RELEASE_TYPES } from './ReleaseType.js';
import { checkDiff } from './checkDiff.js';
import { configGit } from './configGit.js';
import { createRelease } from './createRelease.js';
import { fetchEverything } from './fetchEverything.js';
import { findLastSameReleaseTypeVersion } from './findLastSameReleaseTypeVersion.js';
import { getLastGitTag } from './getLastGitTag.js';
import { getLatestReleaseTag } from './getLatestReleaseTag.js';
import { getOctokit } from './getOctokit.js';
import { getPackageVersion } from './getPackageVersion.js';
import { pushBranch } from './pushBranch.js';
import { setVersion } from './setVersion.js';
import { updateTags } from './updateTags.js';

const DEFAULT_VERSION = '0.1.0';
const STATE_IS_POST = 'isPost';
const STATE_RELEASE_TRANSACTION = 'releaseTransaction';

type ReleaseTransactionState = {
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

function saveReleaseTransactionState(state: ReleaseTransactionState): void {
  saveState(STATE_RELEASE_TRANSACTION, JSON.stringify(state));
}

function updateReleaseTransactionState(
  state: ReleaseTransactionState,
  updates: Partial<ReleaseTransactionState>,
): void {
  Object.assign(state, updates);
  saveReleaseTransactionState(state);
}

function loadReleaseTransactionState(): ReleaseTransactionState | null {
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

async function rollbackStep(
  stepName: string,
  command: string,
  args: string[],
): Promise<boolean> {
  notice(`${stepName}: ${command} ${args.join(' ')}`);
  const output = await getExecOutput(command, args, {
    ignoreReturnCode: true,
  });
  if (output.exitCode === 0) {
    notice(`${stepName}: done`);
    return true;
  }

  warning(`${stepName}: failed with exit code ${output.exitCode}`);
  if (output.stdout.trim() !== '') {
    warning(`${stepName} stdout:\n${output.stdout}`);
  }
  if (output.stderr.trim() !== '') {
    warning(`${stepName} stderr:\n${output.stderr}`);
  }
  return false;
}

function logManualRemediation(state: ReleaseTransactionState): void {
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

export async function nodePackageRelease({
  githubToken,
  directory,
  releaseType,
  prerelease,
  updateShorthandRelease,
  skipIfNoDiff,
  diffTargets,
  dryRun,
  state,
}: {
  githubToken: string;
  directory: string;
  releaseType: ReleaseType;
  prerelease: boolean;
  updateShorthandRelease: boolean;
  skipIfNoDiff: boolean;
  diffTargets: string;
  dryRun: boolean;
  state?: ReleaseTransactionState;
}): Promise<Release | undefined> {
  const updateState = (updates: Partial<ReleaseTransactionState>): void => {
    if (state === undefined) {
      return;
    }
    updateReleaseTransactionState(state, updates);
  };

  const octokit = getOctokit(githubToken);

  await configGitWithToken({ githubToken });
  await configGit();

  startGroup('Fetch every git tag');
  await fetchEverything();
  endGroup();

  startGroup('Get last git tag');
  const lastGitTag = await getLastGitTag();
  notice(`Last git tag: ${lastGitTag}`);
  endGroup();

  startGroup('Get package.json version');
  const packageVersion = await getPackageVersion(directory);
  notice(`package.json version: ${packageVersion}`);
  endGroup();

  startGroup('Get latest release tag');
  const { owner, repo } = context.repo;
  const latestReleaseTag = await getLatestReleaseTag(owner, repo, octokit);
  notice(`Latest release tag: ${latestReleaseTag}`);
  endGroup();

  const versions = [lastGitTag, packageVersion, latestReleaseTag].flatMap(
    (version) => (version === null ? [] : [version]),
  );
  const sortedVersions = rsort(versions);
  const highestVersion =
    sortedVersions.length === 0 ? DEFAULT_VERSION : sortedVersions[0];
  notice(`Highest version: ${highestVersion}`);

  const releaseVersion = inc(highestVersion, releaseType);
  if (releaseVersion === null) {
    setFailed('Failed to compute release version');
    return;
  }
  notice(`Release version: ${releaseVersion}`);
  updateState({ releaseTag: `v${releaseVersion}` });

  if (skipIfNoDiff) {
    const lastSameReleaseTypeVersion = await findLastSameReleaseTypeVersion(
      releaseVersion,
      releaseType,
    );
    notice(`Last same release type version: ${lastSameReleaseTypeVersion}`);

    if (lastSameReleaseTypeVersion !== null) {
      const diff = await checkDiff(
        lastSameReleaseTypeVersion,
        directory,
        diffTargets,
      );
      if (!diff) {
        notice(
          `Skip due to lack of diff between HEAD..${lastSameReleaseTypeVersion}`,
        );
        setOutput('skipped', true);
        return;
      }
    }
    setOutput('skipped', false);
  }

  setOutput('tag', `v${releaseVersion}`);

  await setVersion(releaseVersion, directory);

  await pushBranch(dryRun);
  updateState({ pushBranchCompleted: true });

  const release = await createRelease(
    owner,
    repo,
    releaseVersion,
    prerelease,
    dryRun,
    octokit,
  );
  if (release !== undefined) {
    updateState({ releaseCreated: true });
  }

  if (updateShorthandRelease) {
    await updateTags(releaseVersion, dryRun);
    updateState({ updateShorthandReleaseCompleted: true });
  }

  return release;
}

async function run(): Promise<void> {
  const githubToken = getInput('github-token');
  const directory = getInput('directory');
  const releaseTypeInput = getInput('release-type');
  const releaseType = RELEASE_TYPES.find(
    (supportedReleaseType) =>
      releaseTypeInput.toLowerCase() === supportedReleaseType,
  );
  const prerelease = getBooleanInput('prerelease');
  const updateShorthandRelease = getBooleanInput('update-shorthand-release');
  const skipIfNoDiff = getBooleanInput('skip-if-no-diff');
  const diffTargets = getInput('diff-targets');
  const dryRun = getBooleanInput('dry-run');

  if (releaseType === undefined) {
    setFailed(`Invalid release-type input: ${releaseTypeInput}`);
    return;
  }

  const { branchName, headSha } = await getCurrentGitContext();
  const state: ReleaseTransactionState = {
    completed: false,
    dryRun,
    initialBranchName: branchName,
    initialHeadSha: headSha,
    releaseTag: null,
    pushBranchCompleted: false,
    releaseCreated: false,
    updateShorthandReleaseRequested: updateShorthandRelease,
    updateShorthandReleaseCompleted: false,
  };
  saveReleaseTransactionState(state);

  await nodePackageRelease({
    githubToken,
    directory,
    releaseType,
    prerelease,
    updateShorthandRelease,
    skipIfNoDiff,
    diffTargets,
    dryRun,
    state,
  });
  updateReleaseTransactionState(state, { completed: true });
}

async function cleanup(): Promise<void> {
  startGroup('Post action cleanup');
  const state = loadReleaseTransactionState();

  if (state === null) {
    notice('No release transaction state was found. Nothing to clean up.');
    endGroup();
    return;
  }

  if (state.completed) {
    notice('Release transaction completed successfully. Nothing to clean up.');
    endGroup();
    return;
  }

  notice('Release transaction failed. Starting best-effort cleanup.');

  if (state.dryRun) {
    notice('Dry run mode detected. No remote cleanup is required.');
    endGroup();
    return;
  }

  if (state.pushBranchCompleted && !state.releaseCreated) {
    notice(
      'Failure detected after branch push but before GitHub release creation. Attempting rollback.',
    );
    const rollbackResults: boolean[] = [];

    if (state.releaseTag !== null) {
      rollbackResults.push(
        await rollbackStep(`Delete remote tag ${state.releaseTag}`, 'git', [
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
        await rollbackStep(
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
      warning(
        'Initial branch and HEAD SHA are unavailable. Skipping branch rollback.',
      );
    }

    if (
      rollbackResults.length === 0 ||
      rollbackResults.some((result) => !result)
    ) {
      warning('Automatic rollback did not fully succeed.');
      logManualRemediation(state);
    } else {
      notice('Automatic rollback completed successfully.');
    }
    endGroup();
    return;
  }

  if (state.releaseCreated) {
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
    logManualRemediation(state);
    endGroup();
    return;
  }

  notice('Failure happened before any remote push. No cleanup action is needed.');
  endGroup();
}

if (!getState(STATE_IS_POST)) {
  saveState(STATE_IS_POST, 'true');
  run().catch((error: Error) => setFailed(error));
} else {
  cleanup().catch((error: Error) => setFailed(error));
}
