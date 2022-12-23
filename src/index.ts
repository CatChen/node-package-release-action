import {
  getBooleanInput,
  getInput,
  notice,
  setFailed,
  setOutput,
} from '@actions/core';
import { context } from '@actions/github';
import { inc, rsort } from 'semver';
import { RELEASE_TYPES } from './ReleaseType';
import { checkDiff } from './checkDiff';
import { configGit } from './configGit';
import { createRelease } from './createRelease';
import { fetchEverything } from './fetchEverything';
import { findLastSameReleaseTypeVersion } from './findLastSameReleaseTypeVersion';
import { getLastGitTag } from './getLastGitTag';
import { getLatestReleaseTag } from './getLatestReleaseTag';
import { getOctokit } from './getOctokit';
import { getPackageVersion } from './getPackageVersion';
import { pushBranch } from './pushBranch';
import { setVersion } from './setVersion';
import { updateTags } from './updateTags';

const DEFAULT_VERSION = '0.1.0';

async function run(): Promise<void> {
  await configGit();

  await fetchEverything();

  const lastGitTag = await getLastGitTag();
  notice(`Last git tag: ${lastGitTag}`);

  const packageVersion = await getPackageVersion();
  notice(`package.json version: ${packageVersion}`);

  const { owner, repo } = context.repo;
  const octokit = getOctokit();
  const latestReleaseTag = await getLatestReleaseTag(owner, repo, octokit);
  notice(`Latest release tag: ${latestReleaseTag}`);

  const versions = [lastGitTag, packageVersion, latestReleaseTag].flatMap(
    (version) => (version === null ? [] : [version]),
  );
  const sortedVersions = rsort(versions);
  const highestVersion =
    sortedVersions.length === 0 ? DEFAULT_VERSION : sortedVersions[0];
  notice(`Highest version: ${highestVersion}`);

  const releaseType = RELEASE_TYPES.find(
    (releaseType) => getInput('release-type').toLowerCase() === releaseType,
  );
  if (releaseType === undefined) {
    setFailed(`Invalid release-type input: ${getInput('release-type')}`);
    return;
  }
  const releaseVersion = inc(highestVersion, releaseType);
  if (releaseVersion === null) {
    setFailed('Failed to compute release version');
    return;
  }
  notice(`Release version: ${releaseVersion}`);

  if (getBooleanInput('skip-if-no-diff')) {
    const lastSameReleaseTypeVersion = await findLastSameReleaseTypeVersion(
      releaseVersion,
      releaseType,
    );
    notice(`Last same release type version: ${lastSameReleaseTypeVersion}`);

    if (lastSameReleaseTypeVersion !== null) {
      const diff = await checkDiff(lastSameReleaseTypeVersion);
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

  await setVersion(releaseVersion);

  await pushBranch();

  await createRelease(owner, repo, releaseVersion, octokit);

  if (getBooleanInput('update-shorthand-release')) {
    updateTags(releaseVersion);
  }
}

run();
