"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRelease = createRelease;
const core_1 = require("@actions/core");
async function createRelease(owner, repo, version, octokit) {
    const dryRun = (0, core_1.getBooleanInput)('dry-run');
    if (dryRun) {
        (0, core_1.notice)('Release creation is skipped in dry run');
        const response = await octokit.rest.repos.generateReleaseNotes({
            owner,
            repo,
            tag_name: `v${version}`,
            name: `v${version}`,
        });
        (0, core_1.info)(`Release name: ${response.data.name}`);
        (0, core_1.info)('Release body:\n' + response.data.body + '\n\n');
        return;
    }
    await octokit.rest.repos.createRelease({
        owner,
        repo,
        tag_name: `v${version}`,
        name: `v${version}`,
        generate_release_notes: true,
        prerelease: (0, core_1.getBooleanInput)('prerelease'),
    });
}
