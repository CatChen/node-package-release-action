"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushBranch = pushBranch;
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
async function pushBranch() {
    const dryRun = (0, core_1.getBooleanInput)('dry-run');
    const gitBranchOutput = await (0, exec_1.getExecOutput)('git', [
        'branch',
        '--show-current',
    ]);
    const branchName = gitBranchOutput.stdout;
    if (branchName === '') {
        (0, core_1.error)(`No branch detected`);
        (0, core_1.error)(`Did you forget to set the ref input in the actions/checkout Action?`);
        throw new Error(`No branch detected`);
    }
    (0, core_1.notice)(`Current branch: ${branchName}`);
    await (0, exec_1.getExecOutput)('git', [
        'push',
        '--follow-tags',
        ...(dryRun ? ['--dry-run'] : []),
    ]);
}
