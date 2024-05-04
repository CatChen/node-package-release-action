"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configGit = exports.GITHUB_ACTION_USER_EMAIL = exports.GITHUB_ACTION_USER_NAME = void 0;
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
exports.GITHUB_ACTION_USER_NAME = 'GitHub Action';
exports.GITHUB_ACTION_USER_EMAIL = '41898282+github-actions[bot]@users.noreply.github.com';
async function configGit() {
    await (0, exec_1.getExecOutput)('git', [
        'config',
        '--global',
        'user.name',
        exports.GITHUB_ACTION_USER_NAME,
    ]);
    await (0, exec_1.getExecOutput)('git', [
        'config',
        '--global',
        'user.email',
        exports.GITHUB_ACTION_USER_EMAIL,
    ]);
    await (0, exec_1.getExecOutput)('git', ['config', '--global', 'push.default', 'simple']);
    await (0, exec_1.getExecOutput)('git', [
        'config',
        '--global',
        'push.autoSetupRemote',
        'true',
    ]);
    const githubToken = (0, core_1.getInput)('github-token');
    (0, core_1.exportVariable)('GH_TOKEN', githubToken);
    await (0, exec_1.getExecOutput)('gh', ['auth', 'setup-git']);
}
exports.configGit = configGit;
