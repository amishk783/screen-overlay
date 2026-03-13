import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';

const PLATFORM_BINARY_MAP: Record<string, string> = {
  'darwin-x64': 'darwin-x64/cross-window',
  'darwin-arm64': 'darwin-arm64/cross-window',
  'win32-x64': 'win32-x64/cross-window.exe',
  'win32-arm64': 'win32-arm64/cross-window.exe',
};

function getCandidateBinaryPaths(relative: string): string[] {
  const packagedPath = path.join(__dirname, '..', '..', 'bin', relative);

  if (!packagedPath.includes('app.asar')) {
    return [packagedPath];
  }

  const unpackedPath = packagedPath.replace('app.asar', 'app.asar.unpacked');

  if (unpackedPath === packagedPath) {
    return [packagedPath];
  }

  return [unpackedPath, packagedPath];
}

export function resolveBundledBinaryPath(
  platform = process.platform,
  arch = process.arch
): string {
  const key = `${platform}-${arch}`;
  const relative = PLATFORM_BINARY_MAP[key];

  if (!relative) {
    throw new Error(
      `cross-window: unsupported platform "${key}". ` +
        `Supported: ${Object.keys(PLATFORM_BINARY_MAP).join(', ')}`
    );
  }

  const binaryPaths = getCandidateBinaryPaths(relative);
  const binaryPath = binaryPaths.find((candidate) => fs.existsSync(candidate));

  if (!binaryPath) {
    throw new Error(
      `cross-window: missing bundled binary for "${key}". Checked: ${binaryPaths.join(', ')}. ` +
        `If this is a packaged Electron app, unpack the native binary from app.asar.`
    );
  }

  return binaryPath;
}

export function runNative<T>(args: string[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    execFile(resolveBundledBinaryPath(), args, (err, stdout) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        resolve(JSON.parse(stdout) as T);
      } catch {
        reject(new Error(`cross-window: failed to parse output: ${stdout}`));
      }
    });
  });
}
