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
exports.getAllGitTags = void 0;
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
const semver_1 = require("semver");
function getAllGitTags() {
    return __awaiter(this, void 0, void 0, function* () {
        const tagOutput = yield (0, exec_1.getExecOutput)('git', ['tag']);
        if (tagOutput.exitCode !== core_1.ExitCode.Success) {
            throw new Error(tagOutput.stderr);
        }
        const allTags = tagOutput.stdout.split('\n');
        const versionTags = allTags.filter((tag) => (0, semver_1.valid)(tag));
        return versionTags;
    });
}
exports.getAllGitTags = getAllGitTags;
