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
exports.checkDiff = void 0;
const node_path_1 = require("node:path");
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
const glob_1 = require("@actions/glob");
function checkDiff(tag) {
    return __awaiter(this, void 0, void 0, function* () {
        const directory = (0, core_1.getInput)('directory');
        const diffTargets = (0, core_1.getInput)('diff-targets');
        const globber = yield (0, glob_1.create)((0, node_path_1.join)(directory, diffTargets));
        const glob = yield globber.glob();
        const diffOutput = yield (0, exec_1.getExecOutput)('git', [
            'diff',
            tag,
            '--name-only',
            '--',
            ...glob,
        ]);
        if (diffOutput.exitCode !== core_1.ExitCode.Success) {
            throw new Error(diffOutput.stderr);
        }
        (0, core_1.debug)(`Diff against ${tag}:` +
            '\n' +
            diffOutput.stdout
                .split('\n')
                .map((line) => `  ${line}`)
                .join('\n'));
        return diffOutput.stdout.split('\n').join('') !== '';
    });
}
exports.checkDiff = checkDiff;
