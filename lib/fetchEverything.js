"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchEverything = fetchEverything;
const exec_1 = require("@actions/exec");
async function fetchEverything() {
    await (0, exec_1.getExecOutput)('git', ['fetch', '--tags', 'origin']);
    const gitIsShallowRepositoryOutput = await (0, exec_1.getExecOutput)('git', [
        'rev-parse',
        '--is-shallow-repository',
    ]);
    if (gitIsShallowRepositoryOutput.stdout.trim() === 'true') {
        await (0, exec_1.getExecOutput)('git', ['fetch', '--unshallow', 'origin']);
    }
}
