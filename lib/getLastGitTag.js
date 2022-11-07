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
exports.getLastGitTag = void 0;
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
function getLastGitTag() {
    return __awaiter(this, void 0, void 0, function* () {
        const lastTaggedCommitOutput = yield (0, exec_1.getExecOutput)("git", [
            "rev-list",
            "--tags",
            "--max-count=1",
        ]);
        if (lastTaggedCommitOutput.exitCode !== core_1.ExitCode.Success) {
            throw new Error(lastTaggedCommitOutput.stderr);
        }
        const lastTaggedCommit = lastTaggedCommitOutput.stdout;
        if (lastTaggedCommit === "") {
            // There is no tag at all.
            (0, core_1.warning)(`Tag not found.`);
            return null;
        }
        const gitFetchOutput = yield (0, exec_1.getExecOutput)("git", [
            "fetch",
            "--tags",
            "origin",
        ]);
        if (gitFetchOutput.exitCode !== core_1.ExitCode.Success) {
            throw new Error(gitFetchOutput.stderr);
        }
        const lastTagOutput = yield (0, exec_1.getExecOutput)("git", [
            "describe",
            "--tags",
            lastTaggedCommit,
        ]);
        if (lastTaggedCommitOutput.exitCode !== core_1.ExitCode.Success) {
            throw new Error(lastTagOutput.stderr);
        }
        const lastTag = lastTagOutput.stdout;
        return lastTag;
    });
}
exports.getLastGitTag = getLastGitTag;
