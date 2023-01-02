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
exports.getLatestReleaseTag = void 0;
const core_1 = require("@actions/core");
const request_error_1 = require("@octokit/request-error");
const semver_1 = require("semver");
function getLatestReleaseTag(owner, repo, octokit) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const latestReleaseResponse = yield octokit.rest.repos.getLatestRelease({
                owner,
                repo,
            });
            // Latest release doesn't include pre-release.
            const latestRelease = latestReleaseResponse.data;
            if ((0, semver_1.valid)(latestRelease.tag_name) !== null) {
                return latestRelease.tag_name;
            }
            else {
                (0, core_1.warning)(`Latest release tag is not a valid semver: ${latestRelease.tag_name}`);
            }
        }
        catch (error) {
            if (error instanceof request_error_1.RequestError) {
                if (error.status === 404) {
                    (0, core_1.warning)(`Latest release not found but pre-release may exist`);
                }
                else {
                    throw new Error(`Unexpected error: [${error.status}] ${error.message}`);
                }
            }
            else {
                throw error;
            }
        }
        const releasesResponse = yield octokit.rest.repos.listReleases({
            owner,
            repo,
        });
        if (releasesResponse.data.length === 0) {
            (0, core_1.warning)(`No release found`);
            return null;
        }
        const releaseTags = releasesResponse.data.map((release) => release.tag_name);
        const validReleaseTags = releaseTags.filter((tag) => (0, semver_1.valid)(tag) !== null);
        if (validReleaseTags.length === 0) {
            (0, core_1.warning)(`No valid release tag found`);
            (0, core_1.debug)('Release tags:\n' + releaseTags.map((tag) => `  ${tag}`).join('\n'));
            return null;
        }
        const sortedReleaseTags = (0, semver_1.rsort)(validReleaseTags);
        return sortedReleaseTags[0];
    });
}
exports.getLatestReleaseTag = getLatestReleaseTag;
