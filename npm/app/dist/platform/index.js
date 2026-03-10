"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectAdapter = void 0;
const mac_1 = require("./mac");
const unsupported_1 = require("./unsupported");
const win_1 = require("./win");
function selectAdapter(platform = process.platform) {
    if (platform === 'darwin') {
        return (0, mac_1.createMacAdapter)();
    }
    if (platform === 'win32') {
        return (0, win_1.createWindowsAdapter)();
    }
    return (0, unsupported_1.createUnsupportedAdapter)(platform);
}
exports.selectAdapter = selectAdapter;
