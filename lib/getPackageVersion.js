"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageVersion = exports.DEFAULT_WORKING_DIRECTORY = void 0;
const module_1 = require("module");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const core_1 = require("@actions/core");
exports.DEFAULT_WORKING_DIRECTORY = process.cwd();
function getPackageVersion() {
    const directory = (0, core_1.getInput)('directory');
    const absoluteDirectory = (0, node_path_1.resolve)(exports.DEFAULT_WORKING_DIRECTORY, directory);
    const packageJsonPath = (0, node_path_1.resolve)(absoluteDirectory, 'package.json');
    if (!(0, node_fs_1.existsSync)(packageJsonPath)) {
        (0, core_1.warning)(`package.json cannot be found at ${packageJsonPath}`);
        return null;
    }
    const require = (0, module_1.createRequire)(absoluteDirectory);
    (0, core_1.notice)(`Using package.json from: ${packageJsonPath}`);
    const { version } = require(packageJsonPath);
    return String(version);
}
exports.getPackageVersion = getPackageVersion;
