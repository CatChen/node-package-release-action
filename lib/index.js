"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const semver_1 = require("semver");
const ReleaseType_1 = require("./ReleaseType");
const checkDiff_1 = require("./checkDiff");
const configGit_1 = require("./configGit");
const createRelease_1 = require("./createRelease");
const fetchEverything_1 = require("./fetchEverything");
const findLastSameReleaseTypeVersion_1 = require("./findLastSameReleaseTypeVersion");
const getLastGitTag_1 = require("./getLastGitTag");
const getLatestReleaseTag_1 = require("./getLatestReleaseTag");
const getOctokit_1 = require("./getOctokit");
const getPackageVersion_1 = require("./getPackageVersion");
const pushBranch_1 = require("./pushBranch");
const setVersion_1 = require("./setVersion");
const updateTags_1 = require("./updateTags");
const DEFAULT_VERSION = '0.1.0';
async function run() {
    await (0, configGit_1.configGit)();
    await (0, fetchEverything_1.fetchEverything)();
    (0, core_1.startGroup)('Get last git tag');
    const lastGitTag = await (0, getLastGitTag_1.getLastGitTag)();
    (0, core_1.notice)(`Last git tag: ${lastGitTag}`);
    (0, core_1.endGroup)();
    (0, core_1.startGroup)('Get package.json version');
    const packageVersion = (0, getPackageVersion_1.getPackageVersion)();
    (0, core_1.notice)(`package.json version: ${packageVersion}`);
    (0, core_1.endGroup)();
    (0, core_1.startGroup)('Get latest release tag');
    const { owner, repo } = github_1.context.repo;
    const octokit = (0, getOctokit_1.getOctokit)();
    const latestReleaseTag = await (0, getLatestReleaseTag_1.getLatestReleaseTag)(owner, repo, octokit);
    (0, core_1.notice)(`Latest release tag: ${latestReleaseTag}`);
    (0, core_1.endGroup)();
    const versions = [lastGitTag, packageVersion, latestReleaseTag].flatMap((version) => (version === null ? [] : [version]));
    const sortedVersions = (0, semver_1.rsort)(versions);
    const highestVersion = sortedVersions.length === 0 ? DEFAULT_VERSION : sortedVersions[0];
    (0, core_1.notice)(`Highest version: ${highestVersion}`);
    const releaseType = ReleaseType_1.RELEASE_TYPES.find((releaseType) => (0, core_1.getInput)('release-type').toLowerCase() === releaseType);
    if (releaseType === undefined) {
        (0, core_1.setFailed)(`Invalid release-type input: ${(0, core_1.getInput)('release-type')}`);
        return;
    }
    const releaseVersion = (0, semver_1.inc)(highestVersion, releaseType);
    if (releaseVersion === null) {
        (0, core_1.setFailed)('Failed to compute release version');
        return;
    }
    (0, core_1.notice)(`Release version: ${releaseVersion}`);
    if ((0, core_1.getBooleanInput)('skip-if-no-diff')) {
        const lastSameReleaseTypeVersion = await (0, findLastSameReleaseTypeVersion_1.findLastSameReleaseTypeVersion)(releaseVersion, releaseType);
        (0, core_1.notice)(`Last same release type version: ${lastSameReleaseTypeVersion}`);
        if (lastSameReleaseTypeVersion !== null) {
            const diff = await (0, checkDiff_1.checkDiff)(lastSameReleaseTypeVersion);
            if (!diff) {
                (0, core_1.notice)(`Skip due to lack of diff between HEAD..${lastSameReleaseTypeVersion}`);
                (0, core_1.setOutput)('skipped', true);
                return;
            }
        }
        (0, core_1.setOutput)('skipped', false);
    }
    (0, core_1.setOutput)('tag', `v${releaseVersion}`);
    await (0, setVersion_1.setVersion)(releaseVersion);
    await (0, pushBranch_1.pushBranch)();
    await (0, createRelease_1.createRelease)(owner, repo, releaseVersion, octokit);
    if ((0, core_1.getBooleanInput)('update-shorthand-release')) {
        await (0, updateTags_1.updateTags)(releaseVersion);
    }
}
run().catch((error) => (0, core_1.setFailed)(error));
