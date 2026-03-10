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
    stage?: string;
}
export interface WindowAdapter {
    kind: 'mac' | 'win' | 'unsupported';
    getWindowById(windowId: number): Promise<WindowInfo | null>;
    focusWindow(windowId: number): Promise<FocusResult>;
}
//# sourceMappingURL=types.d.ts.map