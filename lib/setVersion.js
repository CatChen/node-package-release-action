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
exports.setVersion = exports.DEFAULT_WORKING_DIRECTORY = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
exports.DEFAULT_WORKING_DIRECTORY = process.cwd();
function setVersion(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const directory = (0, core_1.getInput)('directory');
        const absoluteDirectory = (0, node_path_1.resolve)(exports.DEFAULT_WORKING_DIRECTORY, directory);
        const packageJsonPath = (0, node_path_1.resolve)(absoluteDirectory, 'package.json');
        if ((0, node_fs_1.existsSync)(packageJsonPath)) {
            yield (0, exec_1.getExecOutput)('npm', ['version', version]);
        }
        else {
            yield (0, exec_1.getExecOutput)('git', ['tag', `v${version}`]);
        }
        (0, core_1.notice)(`Tag created: v${version}`);
    });
}
exports.setVersion = setVersion;
