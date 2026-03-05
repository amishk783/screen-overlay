import { execFile } from 'child_process';
import path from 'path';

// ── Public types ─────────────────────────────────────────────────────────────

export interface WindowInfo {
  window_id: number;
  pid: number;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FocusResult {
  success: boolean;
  window_id?: number;
  pid?: number;
  title?: string;
  /** Diagnostic stage name emitted by the native binary on failure. */
  stage?: string;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Maps a platform+arch key to the relative binary path inside `bin/`. */
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

  return path.join(__dirname, '..', 'bin', relative);
}

function run<T>(args: string[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const binary = getBinaryPath();

    execFile(binary, args, (err, stdout) => {
      if (err) return reject(err);

      try {
        resolve(JSON.parse(stdout) as T);
      } catch {
        reject(new Error(`cross-window: failed to parse output: ${stdout}`));
      }
    });
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns all windows belonging to the process with the given `pid`.
 */
export function getWindows(pid: number): Promise<WindowInfo[]> {
  return run<WindowInfo[]>(['get-windows', String(pid)]);
}

/**
 * Returns the window matching the given `windowId`, or `null` if not found.
 */
export function getWindowById(windowId: number): Promise<WindowInfo | null> {
  return run<WindowInfo | null>(['get-window-by-id', String(windowId)]);
}

/**
 * Focuses the window matching the given `windowId`.
 */
export function focusWindowById(windowId: number): Promise<FocusResult> {
  return run<FocusResult>(['focus', String(windowId)]);
}

/**
 * Alias for {@link focusWindowById}. Focuses the window matching the given `windowId`.
 */
export function focusWindow(windowId: number): Promise<FocusResult> {
  return focusWindowById(windowId);
}
