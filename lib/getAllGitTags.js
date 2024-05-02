"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllGitTags = void 0;
const exec_1 = require("@actions/exec");
const semver_1 = require("semver");
async function getAllGitTags() {
    const tagOutput = await (0, exec_1.getExecOutput)('git', ['tag']);
    const allTags = tagOutput.stdout.split('\n');
    const versionTags = allTags.filter((tag) => (0, semver_1.valid)(tag));
    return versionTags;
}
exports.getAllGitTags = getAllGitTags;
