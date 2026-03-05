import { execFile } from 'child_process';
import path from 'path';

function getBinaryPath() {
  const platform = process.platform;
  const arch = process.arch;

  const map: Record<string, string> = {
    'darwin-x64': 'darwin-x64/cross-window',
    'darwin-arm64': 'darwin-arm64/cross-window',
    'win32-x64': 'win32-x64/cross-window.exe',
  };

  const key = `${platform}-${arch}`;

  if (!map[key]) {
    throw new Error(`Unsupported platform: ${key}`);
  }

  return path.join(__dirname, '..', 'bin', map[key]);
}

function run(args: string[]) {
  return new Promise((resolve, reject) => {
    const binary = getBinaryPath();

    execFile(binary, args, (err, stdout) => {
      if (err) return reject(err);
      resolve(JSON.parse(stdout));
    });
  });
}

export function getWindows(pid: number) {
  return run(['get-windows', String(pid)]);
}

export function focusWindow(pid: number, title: string) {
  return run(['focus', String(pid), title]);
}
export function getWindowById(id: string) {
  return run(['get-window-by-id', id]);
}
