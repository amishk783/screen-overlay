import type { FocusResult, WindowAdapter, WindowInfo } from './types';

interface BrowserWindowLike {
  id: number;
  isDestroyed?: () => boolean;
  getTitle: () => string;
  getBounds: () => { x: number; y: number; width: number; height: number };
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

function loadElectronModule(): ElectronModuleLike | null {
  try {
    return require('electron') as ElectronModuleLike;
  } catch {
    return null;
  }
}

function getWindowPid(window: BrowserWindowLike): number {
  const pid = window.webContents?.getOSProcessId?.();
  return typeof pid === 'number' && pid > 0 ? pid : process.pid;
}

function toWindowInfo(window: BrowserWindowLike): WindowInfo {
  const bounds = window.getBounds();

  return {
    window_id: window.id,
    pid: getWindowPid(window),
    title: window.getTitle(),
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };
}

function getBrowserWindow(
  electronModule: ElectronModuleLike | null,
  windowId: number
): BrowserWindowLike | null {
  const browserWindow = electronModule?.BrowserWindow;

  if (!browserWindow || typeof browserWindow.fromId !== "function") {
    return null;
  }

  const window = browserWindow.fromId(windowId);

  if (!window || window.isDestroyed?.()) {
    return null;
  }

  return window;
}

export function createWindowsAdapter(
  electronModule: ElectronModuleLike | null = loadElectronModule()
): WindowAdapter {
  return {
    kind: 'win',
    async getWindowById(windowId: number): Promise<WindowInfo | null> {
      const window = getBrowserWindow(electronModule, windowId);
      return window ? toWindowInfo(window) : null;
    },
    async focusWindow(windowId: number): Promise<FocusResult> {
      if (!electronModule?.app || !electronModule?.BrowserWindow) {
        return { success: false, stage: 'not_in_electron_main' };
      }

      const window = getBrowserWindow(electronModule, windowId);

      if (!window) {
        return { success: false, stage: 'window_not_found', window_id: windowId };
      }

      try {
        if (window.isMinimized?.()) {
          window.restore?.();
        }

        if (!window.isVisible?.()) {
          window.show?.();
        }

        window.focus();

        if (window.isFocused?.() === false) {
          return {
            success: false,
            stage: 'focus_failed',
            ...toWindowInfo(window),
          };
        }

        return {
          success: true,
          ...toWindowInfo(window),
        };
      } catch {
        return {
          success: false,
          stage: 'focus_failed',
          ...toWindowInfo(window),
        };
      }
    },
  };
}
