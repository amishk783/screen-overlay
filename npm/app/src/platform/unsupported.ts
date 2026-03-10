import type { FocusResult, WindowAdapter, WindowInfo } from './types';

function unsupportedError(platform: string): Error {
  return new Error(
    `cross-window: unsupported platform "${platform}". This package currently supports macOS and Windows only.`
  );
}

export function createUnsupportedAdapter(platform: string): WindowAdapter {
  return {
    kind: 'unsupported',
    async getWindowById(_windowId: number): Promise<WindowInfo | null> {
      throw unsupportedError(platform);
    },
    async focusWindow(_windowId: number): Promise<FocusResult> {
      throw unsupportedError(platform);
    },
  };
}
