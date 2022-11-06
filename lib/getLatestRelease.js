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
exports.getLatestRelease = void 0;
function getLatestRelease(owner, repo, octokit) {
    return __awaiter(this, void 0, void 0, function* () {
        const latestReleaseResponse = yield octokit.rest.repos.getLatestRelease({
            owner,
            repo,
        });
        if (latestReleaseResponse.status === 200) {
            // Latest release doesn't include pre-release.
            const latestRelease = latestReleaseResponse.data;
            return latestRelease.tag_name;
        }
        const releasesResponse = yield octokit.rest.repos.listReleases({
            owner,
            repo,
        });
        if (releasesResponse.data.length === 0) {
            // No release or pre-release available.
            return null;
        }
        const latestRelease = releasesResponse.data[0];
        return latestRelease.tag_name;
    });
}
exports.getLatestRelease = getLatestRelease;
