"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDiff = void 0;
const node_path_1 = require("node:path");
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
const glob_1 = require("glob");
async function checkDiff(tag) {
    const directory = (0, core_1.getInput)('directory');
    const diffTargets = (0, core_1.getInput)('diff-targets');
    const diffOutput = await (0, exec_1.getExecOutput)('git', [
        'diff',
        tag,
        '--name-only',
        '--',
        ...(0, glob_1.globSync)((0, node_path_1.join)(directory, diffTargets)),
    ]);
    (0, core_1.debug)(`Diff against ${tag}:` +
        '\n' +
        diffOutput.stdout
            .split('\n')
            .map((line) => `  ${line}`)
            .join('\n'));
    return diffOutput.stdout.split('\n').join('') !== '';
}
exports.checkDiff = checkDiff;
