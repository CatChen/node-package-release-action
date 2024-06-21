"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastGitTag = getLastGitTag;
const core_1 = require("@actions/core");
const semver_1 = require("semver");
const getAllGitTags_1 = require("./getAllGitTags");
async function getLastGitTag() {
    const versionTags = await (0, getAllGitTags_1.getAllGitTags)();
    if (versionTags.length === 0) {
        (0, core_1.warning)(`No tag found.`);
        return null;
    }
    const sortedTags = (0, semver_1.rsort)(versionTags);
    const lastTag = sortedTags[0];
    return lastTag;
}
