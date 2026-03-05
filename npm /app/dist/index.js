"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWindowById = exports.focusWindow = exports.getWindows = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
function getBinaryPath() {
    const platform = process.platform;
    const arch = process.arch;
    const map = {
        'darwin-x64': 'darwin-x64/cross-window',
        'darwin-arm64': 'darwin-arm64/cross-window',
        'win32-x64': 'win32-x64/cross-window.exe',
    };
    const key = `${platform}-${arch}`;
    if (!map[key]) {
        throw new Error(`Unsupported platform: ${key}`);
    }
    return path_1.default.join(__dirname, '..', 'bin', map[key]);
}
function run(args) {
    return new Promise((resolve, reject) => {
        const binary = getBinaryPath();
        (0, child_process_1.execFile)(binary, args, (err, stdout) => {
            if (err)
                return reject(err);
            resolve(JSON.parse(stdout));
        });
    });
}
function getWindows(pid) {
    return run(['get-windows', String(pid)]);
}
exports.getWindows = getWindows;
function focusWindow(pid, title) {
    return run(['focus', String(pid), title]);
}
exports.focusWindow = focusWindow;
function getWindowById(id) {
    return run(['get-window-by-id', id]);
}
exports.getWindowById = getWindowById;
