"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWindowsAdapter = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const PLATFORM_BINARY_MAP = {
    'darwin-x64': 'darwin-x64/cross-window',
    'darwin-arm64': 'darwin-arm64/cross-window',
    'linux-x64': 'linux-x64/cross-window',
    'linux-arm64': 'linux-arm64/cross-window',
    'win32-x64': 'win32-x64/cross-window.exe',
    'win32-arm64': 'win32-arm64/cross-window.exe',
};
function getBinaryPath() {
    const key = `${process.platform}-${process.arch}`;
    const relative = PLATFORM_BINARY_MAP[key];
    if (!relative) {
        throw new Error(`cross-window: unsupported platform "${key}". ` +
            `Supported: ${Object.keys(PLATFORM_BINARY_MAP).join(', ')}`);
    }
    return path_1.default.join(__dirname, '..', '..', 'bin', relative);
}
function run(args) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.execFile)(getBinaryPath(), args, (err, stdout) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                resolve(JSON.parse(stdout));
            }
            catch (_a) {
                reject(new Error(`cross-window: failed to parse output: ${stdout}`));
            }
        });
    });
}
function createWindowsAdapter() {
    return {
        kind: 'win',
        getWindowById(windowId) {
            return run(['get-window-by-id', String(windowId)]);
        },
        focusWindow(windowId) {
            return run(['focus', String(windowId)]);
        },
    };
}
exports.createWindowsAdapter = createWindowsAdapter;
