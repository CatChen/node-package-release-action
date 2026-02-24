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
import { context } from '@actions/github';
import { configGitWithToken } from 'config-git-with-token-action';
import { type ReleaseType, inc, rsort } from 'semver';
import {
  IS_POST,
  loadReleaseTransactionState,
  saveReleaseTransactionState,
  updateReleaseTransactionState,
} from './ReleaseTransactionState.js';
import { RELEASE_TYPES } from './ReleaseType.js';
import { checkDiff } from './checkDiff.js';
import { configGit } from './configGit.js';
import { createRelease } from './createRelease.js';
import { deleteTag } from './deleteTag.js';
import { fetchEverything } from './fetchEverything.js';
import { findLastSameReleaseTypeVersion } from './findLastSameReleaseTypeVersion.js';
import { getLastGitTag } from './getLastGitTag.js';
import { getLatestReleaseTag } from './getLatestReleaseTag.js';
import { getOctokit } from './getOctokit.js';
import { getPackageVersion } from './getPackageVersion.js';
import { pushBranch } from './pushBranch.js';
import { resetBranch } from './resetBranch.js';
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
  const state = await saveReleaseTransactionState({
    dryRun,
    updateShorthandRelease,
  });

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
  updateReleaseTransactionState(state, { releaseTag: `v${releaseVersion}` });

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
        updateReleaseTransactionState(state, { completed: true });
        return;
      }
    }
    setOutput('skipped', false);
  }

  setOutput('tag', `v${releaseVersion}`);

  await setVersion(releaseVersion, directory);

  await pushBranch(dryRun);
  updateReleaseTransactionState(state, { pushBranchCompleted: true });

  const release = await createRelease(
    owner,
    repo,
    releaseVersion,
    prerelease,
    dryRun,
    octokit,
  );
  if (release !== undefined) {
    updateReleaseTransactionState(state, { releaseCreated: true });
  }

  if (updateShorthandRelease) {
    await updateTags(releaseVersion, dryRun);
    updateReleaseTransactionState(state, {
      updateShorthandReleaseCompleted: true,
    });
  }

  updateReleaseTransactionState(state, { completed: true });
  return release;
}

async function run(): Promise<void> {
  const releaseType = RELEASE_TYPES.find(
    (releaseType) => getInput('release-type').toLowerCase() === releaseType,
  );
  if (releaseType === undefined) {
    setFailed(`Invalid release-type input: ${getInput('release-type')}`);
    return;
  }

  await nodePackageRelease({
    githubToken: getInput('github-token'),
    directory: getInput('directory'),
    releaseType,
    prerelease: getBooleanInput('prerelease'),
    updateShorthandRelease: getBooleanInput('update-shorthand-release'),
    skipIfNoDiff: getBooleanInput('skip-if-no-diff'),
    diffTargets: getInput('diff-targets'),
    dryRun: getBooleanInput('dry-run'),
  });
}

async function cleanup(): Promise<void> {
  startGroup('Post action cleanup');
  try {
    const state = loadReleaseTransactionState()!;

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
      notice(
        'Failure detected after branch push but before GitHub release creation. Attempting rollback.',
      );
      if (state.releaseTag !== null) {
        await deleteTag(state.releaseTag);
      } else {
        warning('Release tag is unavailable. Skipping remote tag deletion.');
      }

      if (state.initialBranchName !== null && state.initialHeadSha !== null) {
        await resetBranch(state.initialBranchName, state.initialHeadSha);
      } else {
        warning('Initial branch and HEAD SHA are unavailable. Skipping rollback.');
      }
      notice('Best-effort rollback finished.');
      return;
    }

    if (state.releaseCreated && !state.updateShorthandReleaseCompleted) {
      warning(
        `GitHub Release ${state.releaseTag ?? '(unknown tag)'} was already created before failure.` +
          '\nAutomatic rollback is skipped to avoid deleting published artifacts unexpectedly.',
      );
      warning(
        'Shorthand tag update may be incomplete. Update shorthand tags manually if needed.',
      );
      return;
    }

    notice(
      'Failure happened before any remote push. No cleanup action is needed.',
    );
  } finally {
    endGroup();
  }
}

if (!getState(IS_POST)) {
  saveState(IS_POST, 'true');
  run().catch((error: Error) => setFailed(error));
} else {
  cleanup().catch((error: Error) => setFailed(error));
}
