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
const github_1 = require("@actions/github");
const core_1 = require("@actions/core");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, core_1.info)(`This is the Action context: ${JSON.stringify(github_1.context)}`);
        (0, core_1.error)("Action needs to be implemented.");
    });
}
function cleanup() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, core_1.error)("Post action needs to be implemented or removed.");
    });
}
if (!process.env["STATE_isPost"]) {
    run();
}
else {
    cleanup();
}
