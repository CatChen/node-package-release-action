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
const exec_1 = require("@actions/exec");
function getLastGitTag() {
    return __awaiter(this, void 0, void 0, function* () {
        const lastTaggedCommitOutput = yield (0, exec_1.getExecOutput)("git", [
            "rev-list",
            "--tags",
            "--max-count=1",
        ]);
        console.log(lastTaggedCommitOutput);
        console.log(JSON.stringify(lastTaggedCommitOutput));
        if (lastTaggedCommitOutput.exitCode !== 0) {
            throw new Error(lastTaggedCommitOutput.stderr);
        }
        const lastTaggedCommit = lastTaggedCommitOutput.stdout;
        const lastTagOutput = yield (0, exec_1.getExecOutput)("git", [
            "describe",
            "--tags",
            lastTaggedCommit,
        ]);
        if (lastTaggedCommitOutput.exitCode !== 0) {
            throw new Error(lastTagOutput.stderr);
        }
        const lastTag = lastTagOutput.stdout;
        return lastTag;
    });
}
exports.getLastGitTag = getLastGitTag;
