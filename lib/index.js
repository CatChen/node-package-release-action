"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const semver_1 = require("semver");
const ReleaseType_1 = require("./ReleaseType");
const getOctokit_1 = require("./getOctokit");
const configGit_1 = require("./configGit");
const fetchEverything_1 = require("./fetchEverything");
const getLastGitTag_1 = require("./getLastGitTag");
const getPackageVersion_1 = require("./getPackageVersion");
const getlatestReleaseTag_1 = require("./getlatestReleaseTag");
const findLastSameReleaseTypeVersion_1 = require("./findLastSameReleaseTypeVersion");
const setVersion_1 = require("./setVersion");
const pushBranch_1 = require("./pushBranch");
const createRelease_1 = require("./createRelease");
const updateTags_1 = require("./updateTags");
const checkDiff_1 = require("./checkDiff");
const DEFAULT_VERSION = "0.1.0";
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, configGit_1.configGit)();
        yield (0, fetchEverything_1.fetchEverything)();
        const lastGitTag = yield (0, getLastGitTag_1.getLastGitTag)();
        (0, core_1.notice)(`Last git tag: ${lastGitTag}`);
        const packageVersion = yield (0, getPackageVersion_1.getPackageVersion)();
        (0, core_1.notice)(`package.json version: ${packageVersion}`);
        const { owner, repo } = github_1.context.repo;
        const octokit = (0, getOctokit_1.getOctokit)();
        const latestReleaseTag = yield (0, getlatestReleaseTag_1.getlatestReleaseTag)(owner, repo, octokit);
        (0, core_1.notice)(`Latest release tag: ${latestReleaseTag}`);
        const versions = [lastGitTag, packageVersion, latestReleaseTag].flatMap((version) => (version === null ? [] : [version]));
        const sortedVersions = (0, semver_1.rsort)(versions);
        const highestVersion = sortedVersions.length === 0 ? DEFAULT_VERSION : sortedVersions[0];
        (0, core_1.notice)(`Highest version: ${highestVersion}`);
        const releaseType = ReleaseType_1.RELEASE_TYPES.find((releaseType) => (0, core_1.getInput)("release-type").toLowerCase() === releaseType);
        if (releaseType === undefined) {
            (0, core_1.setFailed)(`Invalid release-type input: ${(0, core_1.getInput)("release-type")}`);
            return;
        }
        const releaseVersion = (0, semver_1.inc)(highestVersion, releaseType);
        if (releaseVersion === null) {
            (0, core_1.setFailed)("Failed to compute release version");
            return;
        }
        (0, core_1.notice)(`Release version: ${releaseVersion}`);
        if ((0, core_1.getBooleanInput)("skip-if-no-diff")) {
            const lastSameReleaseTypeVersion = yield (0, findLastSameReleaseTypeVersion_1.findLastSameReleaseTypeVersion)(releaseVersion, releaseType);
            (0, core_1.notice)(`Last same release type version: ${lastSameReleaseTypeVersion}`);
            if (lastSameReleaseTypeVersion !== null) {
                const diff = yield (0, checkDiff_1.checkDiff)(lastSameReleaseTypeVersion);
                if (!diff) {
                    (0, core_1.notice)(`Skip due to lack of diff between HEAD..${lastSameReleaseTypeVersion}`);
                    (0, core_1.setOutput)("skipped", true);
                    return;
                }
            }
            (0, core_1.setOutput)("skipped", false);
        }
        (0, core_1.setOutput)("tag", releaseVersion);
        yield (0, setVersion_1.setVersion)(releaseVersion);
        yield (0, pushBranch_1.pushBranch)();
        yield (0, createRelease_1.createRelease)(owner, repo, releaseVersion, octokit);
        if ((0, core_1.getBooleanInput)("update-shorthand-release")) {
            (0, updateTags_1.updateTags)(releaseVersion);
        }
    });
}
run();
