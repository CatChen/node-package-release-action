"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_WORKING_DIRECTORY = void 0;
exports.setVersion = setVersion;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
exports.DEFAULT_WORKING_DIRECTORY = process.cwd();
async function setVersion(version) {
    const directory = (0, core_1.getInput)('directory');
    const absoluteDirectory = (0, node_path_1.resolve)(exports.DEFAULT_WORKING_DIRECTORY, directory);
    const packageJsonPath = (0, node_path_1.resolve)(absoluteDirectory, 'package.json');
    if ((0, node_fs_1.existsSync)(packageJsonPath)) {
        await (0, exec_1.getExecOutput)('npm', ['version', version]);
    }
    else {
        await (0, exec_1.getExecOutput)('git', ['tag', `v${version}`]);
    }
    (0, core_1.notice)(`Tag created: v${version}`);
}
