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
/**
 * Returns all windows belonging to the process with the given `pid`.
 */
export declare function getWindows(pid: number): Promise<WindowInfo[]>;
/**
 * Returns the window matching the given `windowId`, or `null` if not found.
 */
export declare function getWindowById(windowId: number): Promise<WindowInfo | null>;
/**
 * Focuses the window matching the given `windowId`.
 */
export declare function focusWindowById(windowId: number): Promise<FocusResult>;
/**
 * Alias for {@link focusWindowById}. Focuses the window matching the given `windowId`.
 */
export declare function focusWindow(windowId: number): Promise<FocusResult>;
//# sourceMappingURL=index.d.ts.map