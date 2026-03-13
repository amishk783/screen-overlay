import { runNative } from './native';
import type { FocusResult, WindowAdapter, WindowInfo } from './types';

export function createMacAdapter(): WindowAdapter {
  return {
    kind: 'mac',
    getWindowById(windowId: number): Promise<WindowInfo | null> {
      return runNative<WindowInfo | null>(['get-window-by-id', String(windowId)]);
    },
    focusWindow(windowId: number): Promise<FocusResult> {
      return runNative<FocusResult>(['focus', String(windowId)]);
    },
  };
}
