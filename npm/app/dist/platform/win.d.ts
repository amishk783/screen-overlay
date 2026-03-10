import type { WindowAdapter } from './types';
interface BrowserWindowLike {
    id: number;
    isDestroyed?: () => boolean;
    getTitle: () => string;
    getBounds: () => {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    isMinimized?: () => boolean;
    restore?: () => void;
    isVisible?: () => boolean;
    show?: () => void;
    focus: () => void;
    isFocused?: () => boolean;
    webContents?: {
        getOSProcessId?: () => number;
    };
}
interface ElectronModuleLike {
    app?: {
        name?: string;
    };
    BrowserWindow?: {
        fromId: (id: number) => BrowserWindowLike | null;
    };
}
export declare function createWindowsAdapter(electronModule?: ElectronModuleLike | null): WindowAdapter;
export {};
//# sourceMappingURL=win.d.ts.map