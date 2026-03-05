"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.focusWindow = exports.focusWindowById = exports.getWindowById = exports.getWindows = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
// ── Internal helpers ──────────────────────────────────────────────────────────
/** Maps a platform+arch key to the relative binary path inside `bin/`. */
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
    return path_1.default.join(__dirname, '..', 'bin', relative);
}
function run(args) {
    return new Promise((resolve, reject) => {
        const binary = getBinaryPath();
        (0, child_process_1.execFile)(binary, args, (err, stdout) => {
            if (err)
                return reject(err);
            try {
                resolve(JSON.parse(stdout));
            }
            catch (_a) {
                reject(new Error(`cross-window: failed to parse output: ${stdout}`));
            }
        });
    });
}
// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Returns all windows belonging to the process with the given `pid`.
 */
function getWindows(pid) {
    return run(['get-windows', String(pid)]);
}
exports.getWindows = getWindows;
/**
 * Returns the window matching the given `windowId`, or `null` if not found.
 */
function getWindowById(windowId) {
    return run(['get-window-by-id', String(windowId)]);
}
exports.getWindowById = getWindowById;
/**
 * Focuses the window matching the given `windowId`.
 */
function focusWindowById(windowId) {
    return run(['focus', String(windowId)]);
}
exports.focusWindowById = focusWindowById;
/**
 * Alias for {@link focusWindowById}. Focuses the window matching the given `windowId`.
 */
function focusWindow(windowId) {
    return focusWindowById(windowId);
}
exports.focusWindow = focusWindow;
