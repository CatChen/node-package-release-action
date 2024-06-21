"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLastSameReleaseTypeVersion = findLastSameReleaseTypeVersion;
const core_1 = require("@actions/core");
const semver_1 = require("semver");
const getAllGitTags_1 = require("./getAllGitTags");
async function findLastSameReleaseTypeVersion(releaseVersion, releaseType) {
    const versionTags = await (0, getAllGitTags_1.getAllGitTags)();
    if (versionTags.length === 0) {
        (0, core_1.warning)(`No tag found.`);
        return null;
    }
    const sortedTags = (0, semver_1.rsort)(versionTags);
    let candidateTag = sortedTags.shift();
    while (candidateTag !== undefined &&
        ((0, semver_1.gte)(candidateTag, releaseVersion) ||
            (0, semver_1.diff)(candidateTag, releaseVersion) !== releaseType)) {
        candidateTag = sortedTags.shift();
    }
    let cursorTag = candidateTag;
    while (cursorTag !== undefined &&
        (0, semver_1.diff)(cursorTag, releaseVersion) === releaseType &&
        (0, semver_1.inc)(cursorTag, releaseType) === releaseVersion) {
        candidateTag = cursorTag;
        cursorTag = sortedTags.shift();
    }
    if (candidateTag === undefined) {
        (0, core_1.warning)(`No tag found.`);
        return null;
    }
    return candidateTag;
}
