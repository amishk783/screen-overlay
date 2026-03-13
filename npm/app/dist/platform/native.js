"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runNative = exports.resolveBundledBinaryPath = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const PLATFORM_BINARY_MAP = {
    'darwin-x64': 'darwin-x64/cross-window',
    'darwin-arm64': 'darwin-arm64/cross-window',
    'win32-x64': 'win32-x64/cross-window.exe',
    'win32-arm64': 'win32-arm64/cross-window.exe',
};
function getCandidateBinaryPaths(relative) {
    const packagedPath = path_1.default.join(__dirname, '..', '..', 'bin', relative);
    if (!packagedPath.includes('app.asar')) {
        return [packagedPath];
    }
    const unpackedPath = packagedPath.replace('app.asar', 'app.asar.unpacked');
    if (unpackedPath === packagedPath) {
        return [packagedPath];
    }
    return [unpackedPath, packagedPath];
}
function resolveBundledBinaryPath(platform = process.platform, arch = process.arch) {
    const key = `${platform}-${arch}`;
    const relative = PLATFORM_BINARY_MAP[key];
    if (!relative) {
        throw new Error(`cross-window: unsupported platform "${key}". ` +
            `Supported: ${Object.keys(PLATFORM_BINARY_MAP).join(', ')}`);
    }
    const binaryPaths = getCandidateBinaryPaths(relative);
    const binaryPath = binaryPaths.find((candidate) => fs_1.default.existsSync(candidate));
    if (!binaryPath) {
        throw new Error(`cross-window: missing bundled binary for "${key}". Checked: ${binaryPaths.join(', ')}. ` +
            `If this is a packaged Electron app, unpack the native binary from app.asar.`);
    }
    return binaryPath;
}
exports.resolveBundledBinaryPath = resolveBundledBinaryPath;
function runNative(args) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.execFile)(resolveBundledBinaryPath(), args, (err, stdout) => {
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
exports.runNative = runNative;
