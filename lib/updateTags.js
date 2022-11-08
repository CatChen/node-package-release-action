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
exports.updateTags = void 0;
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
const semver_1 = require("semver");
function updateTags(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const semver = (0, semver_1.parse)(version);
        const dryRun = (0, core_1.getBooleanInput)("dry-run");
        if (semver === null) {
            throw new Error(`Failed to parse the version as semver: ${version}`);
        }
        if (semver.prerelease.length !== 0) {
            (0, core_1.warning)(`Pre-release version should not be used to update shorthand tags: ${version}`);
            (0, core_1.warning)("Please don't set release-type to prerelease and update-shorthand-release to true at the same time");
        }
        if (semver.major > 0) {
            const gitTagMajorOutput = yield (0, exec_1.getExecOutput)("git", [
                "tag",
                "-f",
                `v${semver.major}`,
            ]);
            if (gitTagMajorOutput.exitCode !== 0) {
                throw new Error(gitTagMajorOutput.stderr);
            }
            (0, core_1.notice)(`Tag updated: v${semver.major}`);
        }
        else {
            (0, core_1.warning)(`Tag v0 is not allowed so it's not updated`);
        }
        if (semver.major > 0 || semver.minor > 0) {
            const gitTagMinorOutput = yield (0, exec_1.getExecOutput)("git", [
                "tag",
                "-f",
                `v${semver.major}.${semver.minor}`,
            ]);
            if (gitTagMinorOutput.exitCode !== 0) {
                throw new Error(gitTagMinorOutput.stderr);
            }
            (0, core_1.notice)(`Tag updated: v${semver.major}.${semver.minor}`);
        }
        else {
            (0, core_1.warning)(`Tag v0.0 is not allowed so it's not updated`);
        }
        const gitPushOutput = yield (0, exec_1.getExecOutput)("git", [
            "push",
            "-f",
            "--tags",
            ...(dryRun ? ["--dry-run"] : []),
        ]);
        if (gitPushOutput.exitCode !== core_1.ExitCode.Success) {
            throw new Error(gitPushOutput.stderr);
        }
    });
}
exports.updateTags = updateTags;
