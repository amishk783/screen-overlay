import { execFile } from 'child_process';
import path from 'path';
import type { FocusResult, WindowAdapter, WindowInfo } from './types';

const PLATFORM_BINARY_MAP: Record<string, string> = {
  'darwin-x64': 'darwin-x64/cross-window',
  'darwin-arm64': 'darwin-arm64/cross-window',
  'linux-x64': 'linux-x64/cross-window',
  'linux-arm64': 'linux-arm64/cross-window',
  'win32-x64': 'win32-x64/cross-window.exe',
  'win32-arm64': 'win32-arm64/cross-window.exe',
};

function getBinaryPath(): string {
  const key = `${process.platform}-${process.arch}`;
  const relative = PLATFORM_BINARY_MAP[key];

  if (!relative) {
    throw new Error(
      `cross-window: unsupported platform "${key}". ` +
        `Supported: ${Object.keys(PLATFORM_BINARY_MAP).join(', ')}`
    );
  }

  return path.join(__dirname, '..', '..', 'bin', relative);
}

function run<T>(args: string[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    execFile(getBinaryPath(), args, (err, stdout) => {
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

export function createMacAdapter(): WindowAdapter {
  return {
    kind: 'mac',
    getWindowById(windowId: number): Promise<WindowInfo | null> {
      return run<WindowInfo | null>(['get-window-by-id', String(windowId)]);
    },
    focusWindow(windowId: number): Promise<FocusResult> {
      return run<FocusResult>(['focus', String(windowId)]);
    },
  };
}
