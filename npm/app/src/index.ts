import { selectAdapter } from './platform';
import type { FocusResult, WindowInfo } from './platform/types';

const adapter = selectAdapter();

export type { FocusResult, WindowInfo } from './platform/types';

/**
 * Returns the window matching the given `windowId`, or `null` if not found.
 */
export function getWindowById(windowId: number): Promise<WindowInfo | null> {
  return adapter.getWindowById(windowId);
}

/**
 * Focuses the window matching the given `windowId`.
 */
export function focusWindow(windowId: number): Promise<FocusResult> {
  return adapter.focusWindow(windowId);
}
