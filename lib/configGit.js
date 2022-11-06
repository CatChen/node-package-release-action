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
exports.configGit = exports.GITHUB_ACTION_USER_EMAIL = exports.GITHUB_ACTION_USER_NAME = void 0;
const exec_1 = require("@actions/exec");
exports.GITHUB_ACTION_USER_NAME = "GitHub Action";
exports.GITHUB_ACTION_USER_EMAIL = "41898282+github-actions[bot]@users.noreply.github.com";
function configGit() {
    return __awaiter(this, void 0, void 0, function* () {
        const gitConfigNameOutput = yield (0, exec_1.getExecOutput)("git", [
            "config",
            "--global",
            "user.name",
            exports.GITHUB_ACTION_USER_NAME,
        ]);
        if (gitConfigNameOutput.exitCode !== 0) {
            throw new Error(gitConfigNameOutput.stderr);
        }
        const gitConfigEmailOutput = yield (0, exec_1.getExecOutput)("git", [
            "config",
            "--global",
            "user.email",
            exports.GITHUB_ACTION_USER_EMAIL,
        ]);
        if (gitConfigEmailOutput.exitCode !== 0) {
            throw new Error(gitConfigEmailOutput.stderr);
        }
        const ghAuthOutput = yield (0, exec_1.getExecOutput)("gh", ["auth", "setup-git"]);
        if (ghAuthOutput.exitCode !== 0) {
            throw new Error(ghAuthOutput.stderr);
        }
    });
}
exports.configGit = configGit;
