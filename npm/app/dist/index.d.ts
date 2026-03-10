import type { FocusResult, WindowInfo } from './platform/types';
export type { FocusResult, WindowInfo } from './platform/types';
/**
 * Returns the window matching the given `windowId`, or `null` if not found.
 */
export declare function getWindowById(windowId: number): Promise<WindowInfo | null>;
/**
 * Focuses the window matching the given `windowId`.
 */
export declare function focusWindow(windowId: number): Promise<FocusResult>;
//# sourceMappingURL=index.d.ts.map