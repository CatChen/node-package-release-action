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
exports.findLastSameReleaseTypeVersion = void 0;
const core_1 = require("@actions/core");
const semver_1 = require("semver");
const getAllGitTags_1 = require("./getAllGitTags");
function findLastSameReleaseTypeVersion(releaseVersion, releaseType) {
    return __awaiter(this, void 0, void 0, function* () {
        const versionTags = yield (0, getAllGitTags_1.getAllGitTags)();
        if (versionTags.length === 0) {
            (0, core_1.warning)(`No tag found.`);
            return null;
        }
        const sortedTags = (0, semver_1.rsort)(versionTags);
        let candidateTag = sortedTags.shift();
        while (candidateTag !== undefined &&
            ((0, semver_1.gte)(candidateTag, releaseVersion) ||
                (0, semver_1.diff)(candidateTag, releaseType) !== releaseType)) {
            candidateTag = sortedTags.shift();
        }
        if (candidateTag === undefined) {
            (0, core_1.warning)(`No tag found.`);
            return null;
        }
        return candidateTag;
    });
}
exports.findLastSameReleaseTypeVersion = findLastSameReleaseTypeVersion;
