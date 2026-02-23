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
} from '@actions/core';
import { context } from '@actions/github';
import { configGitWithToken } from 'config-git-with-token-action';
import { type ReleaseType, inc, rsort } from 'semver';
import {
  type ReleaseTransactionState,
  STATE_IS_POST,
  createReleaseTransactionState,
  loadReleaseTransactionState,
  saveReleaseTransactionState,
  updateReleaseTransactionState,
} from './ReleaseTransactionState.js';
import { RELEASE_TYPES } from './ReleaseType.js';
import { checkDiff } from './checkDiff.js';
import { cleanupAfterPushWithoutRelease } from './cleanupAfterPushWithoutRelease.js';
import { cleanupAfterReleaseCreatedFailure } from './cleanupAfterReleaseCreatedFailure.js';
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

export async function nodePackageRelease({
  githubToken,
  directory,
  releaseType,
  prerelease,
  updateShorthandRelease,
  skipIfNoDiff,
  diffTargets,
  dryRun,
}: {
  githubToken: string;
  directory: string;
  releaseType: ReleaseType;
  prerelease: boolean;
  updateShorthandRelease: boolean;
  skipIfNoDiff: boolean;
  diffTargets: string;
  dryRun: boolean;
}): Promise<Release | undefined> {
  const state = await createReleaseTransactionState({
    dryRun,
    updateShorthandReleaseRequested: updateShorthandRelease,
  });
  saveReleaseTransactionState(state);

  const updateState = (updates: Partial<ReleaseTransactionState>): void => {
    updateReleaseTransactionState(state, updates);
  };
  let completed = false;

  try {
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
          completed = true;
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

    completed = true;
    return release;
  } finally {
    if (completed) {
      updateReleaseTransactionState(state, { completed: true });
    }
  }
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

  await nodePackageRelease({
    githubToken,
    directory,
    releaseType,
    prerelease,
    updateShorthandRelease,
    skipIfNoDiff,
    diffTargets,
    dryRun,
  });
}

async function cleanup(): Promise<void> {
  startGroup('Post action cleanup');
  try {
    const state = loadReleaseTransactionState();

    if (state === null) {
      notice('No release transaction state was found. Nothing to clean up.');
      return;
    }

    if (state.completed) {
      notice(
        'Release transaction completed successfully. Nothing to clean up.',
      );
      return;
    }

    notice('Release transaction failed. Starting best-effort cleanup.');

    if (state.dryRun) {
      notice('Dry run mode detected. No remote cleanup is required.');
      return;
    }

    if (state.pushBranchCompleted && !state.releaseCreated) {
      await cleanupAfterPushWithoutRelease(state);
      return;
    }

    if (state.releaseCreated) {
      cleanupAfterReleaseCreatedFailure(state);
      return;
    }

    notice(
      'Failure happened before any remote push. No cleanup action is needed.',
    );
  } finally {
    endGroup();
  }
}

if (!getState(STATE_IS_POST)) {
  saveState(STATE_IS_POST, 'true');
  run().catch((error: Error) => setFailed(error));
} else {
  cleanup().catch((error: Error) => setFailed(error));
}
