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
const getOctokit_1 = require("./getOctokit");
const github_1 = require("@actions/github");
const getLastGitTag_1 = require("./getLastGitTag");
const getPackageVersion_1 = require("./getPackageVersion");
const getLatestRelease_1 = require("./getLatestRelease");
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
    });
}
function cleanup() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, core_1.error)("Post action needs to be implemented or removed.");
    });
}
if (!process.env["STATE_isPost"]) {
    run();
}
else {
    cleanup();
}
