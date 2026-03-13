import { runNative } from './native';
import type { FocusResult, WindowAdapter, WindowInfo } from './types';

export function createWindowsAdapter(): WindowAdapter {
  return {
    kind: 'win',
    getWindowById(windowId: number): Promise<WindowInfo | null> {
      return runNative<WindowInfo | null>(['get-window-by-id', String(windowId)]);
    },
    focusWindow(windowId: number): Promise<FocusResult> {
      return runNative<FocusResult>(['focus', String(windowId)]);
    },
  };
}
