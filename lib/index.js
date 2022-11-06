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
const getOctokit_1 = require("./getOctokit");
const getLastGitTag_1 = require("./getLastGitTag");
const getPackageVersion_1 = require("./getPackageVersion");
const getLatestRelease_1 = require("./getLatestRelease");
const configGit_1 = require("./configGit");
const setVersion_1 = require("./setVersion");
const pushBranch_1 = require("./pushBranch");
const RELEASE_TYPES = [
    "major",
    "premajor",
    "minor",
    "preminor",
    "patch",
    "prepatch",
    "prerelease",
];
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const lastGitTag = yield (0, getLastGitTag_1.getLastGitTag)();
        (0, core_1.notice)(`Last git tag: ${lastGitTag}`);
        const packageVersion = yield (0, getPackageVersion_1.getPackageVersion)();
        (0, core_1.notice)(`package.json version: ${packageVersion}`);
        const { owner, repo } = github_1.context.repo;
        const octokit = (0, getOctokit_1.getOctokit)();
        const latestRelease = yield (0, getLatestRelease_1.getLatestRelease)(owner, repo, octokit);
        (0, core_1.notice)(`Latest release: ${latestRelease}`);
        const versions = [lastGitTag, packageVersion, latestRelease].flatMap((version) => (version === null ? [] : [version]));
        const highestVersion = (0, semver_1.rsort)(versions)[0];
        (0, core_1.notice)(`Highest version: ${highestVersion}`);
        const releaseType = RELEASE_TYPES.find((releaseType) => (0, core_1.getInput)("release-type").toLowerCase() === releaseType);
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
        yield (0, configGit_1.configGit)();
        yield (0, setVersion_1.setVersion)(releaseVersion);
        yield (0, pushBranch_1.pushBranch)();
    });
}
run();
