"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTags = void 0;
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
const semver_1 = require("semver");
async function updateTags(version) {
    const semver = (0, semver_1.parse)(version);
    const dryRun = (0, core_1.getBooleanInput)('dry-run');
    if (semver === null) {
        throw new Error(`Failed to parse the version as semver: ${version}`);
    }
    if (semver.prerelease.length !== 0) {
        (0, core_1.warning)(`Pre-release version should not be used to update shorthand tags: ${version}` +
            "\nPlease don't set release-type to prerelease and update-shorthand-release to true at the same time");
    }
    if (semver.major > 0) {
        await (0, exec_1.getExecOutput)('git', ['tag', '-f', `v${semver.major}`]);
        (0, core_1.notice)(`Tag updated: v${semver.major}`);
    }
    else {
        (0, core_1.warning)(`Tag v0 is not allowed so it's not updated`);
    }
    if (semver.major > 0 || semver.minor > 0) {
        await (0, exec_1.getExecOutput)('git', [
            'tag',
            '-f',
            `v${semver.major}.${semver.minor}`,
        ]);
        (0, core_1.notice)(`Tag updated: v${semver.major}.${semver.minor}`);
    }
    else {
        (0, core_1.warning)(`Tag v0.0 is not allowed so it's not updated`);
    }
    await (0, exec_1.getExecOutput)('git', [
        'push',
        '-f',
        '--tags',
        ...(dryRun ? ['--dry-run'] : []),
    ]);
}
exports.updateTags = updateTags;
