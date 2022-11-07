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
exports.pushBranch = void 0;
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
function pushBranch() {
    return __awaiter(this, void 0, void 0, function* () {
        const dryRun = (0, core_1.getBooleanInput)("dry-run");
        const gitBranchOutput = yield (0, exec_1.getExecOutput)("git", [
            "branch",
            "--show-current",
        ]);
        if (gitBranchOutput.exitCode !== core_1.ExitCode.Success) {
            throw new Error(gitBranchOutput.stderr);
        }
        const branchName = gitBranchOutput.stdout;
        if (branchName === "") {
            (0, core_1.error)(`No branch detected`);
            (0, core_1.error)(`Did you forget to set the ref input in the actions/checkout Action?`);
            throw new Error(`No branch detected`);
        }
        (0, core_1.notice)(`Current branch: ${branchName}`);
        const gitPushOutput = yield (0, exec_1.getExecOutput)("git", [
            "push",
            "--follow-tags",
            ...(dryRun ? ["--dry-run"] : []),
        ]);
        if (gitPushOutput.exitCode !== core_1.ExitCode.Success) {
            throw new Error(gitPushOutput.stderr);
        }
    });
}
exports.pushBranch = pushBranch;
