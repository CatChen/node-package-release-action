import { getBooleanInput, notice, warning } from '@actions/core';
import { getExecOutput } from '@actions/exec';
import { parse } from 'semver';

export async function updateTags(version: string) {
  const semver = parse(version);
  const dryRun = getBooleanInput('dry-run');

  if (semver === null) {
    throw new Error(`Failed to parse the version as semver: ${version}`);
  }

  if (semver.prerelease.length !== 0) {
    warning(
      `Pre-release version should not be used to update shorthand tags: ${version}` +
        "\nPlease don't set release-type to prerelease and update-shorthand-release to true at the same time",
    );
  }

  if (semver.major > 0) {
    await getExecOutput('git', ['tag', '-f', `v${semver.major}`]);
    notice(`Tag updated: v${semver.major}`);
  } else {
    warning(`Tag v0 is not allowed so it's not updated`);
  }

  if (semver.major > 0 || semver.minor > 0) {
    await getExecOutput('git', [
      'tag',
      '-f',
      `v${semver.major}.${semver.minor}`,
    ]);
    notice(`Tag updated: v${semver.major}.${semver.minor}`);
  } else {
    warning(`Tag v0.0 is not allowed so it's not updated`);
  }

  await getExecOutput('git', [
    'push',
    '-f',
    '--tags',
    ...(dryRun ? ['--dry-run'] : []),
  ]);
}
