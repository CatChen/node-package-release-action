import type { Release } from '@octokit/webhooks-types';
import {
  endGroup,
  getBooleanInput,
  getInput,
  notice,
  setFailed,
  setOutput,
  startGroup,
} from '@actions/core';
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
  const packageVersion = getPackageVersion(directory);
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

  const release = await createRelease(
    owner,
    repo,
    releaseVersion,
    prerelease,
    dryRun,
    octokit,
  );

  if (updateShorthandRelease) {
    await updateTags(releaseVersion, dryRun);
  }

  return release;
}

async function run(): Promise<void> {
  const releaseType = RELEASE_TYPES.find(
    (releaseType: string) =>
      getInput('release-type').toLowerCase() === releaseType,
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

run().catch((error: Error) => setFailed(error));
