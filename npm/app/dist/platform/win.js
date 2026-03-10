"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWindowsAdapter = void 0;
function loadElectronModule() {
    try {
        return require('electron');
    }
    catch (_a) {
        return null;
    }
}
function getWindowPid(window) {
    var _a, _b;
    const pid = (_b = (_a = window.webContents) === null || _a === void 0 ? void 0 : _a.getOSProcessId) === null || _b === void 0 ? void 0 : _b.call(_a);
    return typeof pid === 'number' && pid > 0 ? pid : process.pid;
}
function toWindowInfo(window) {
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
function getBrowserWindow(electronModule, windowId) {
    var _a;
    const browserWindow = electronModule === null || electronModule === void 0 ? void 0 : electronModule.BrowserWindow;
    if (!browserWindow || typeof browserWindow.fromId !== "function") {
        return null;
    }
    const window = browserWindow.fromId(windowId);
    if (!window || ((_a = window.isDestroyed) === null || _a === void 0 ? void 0 : _a.call(window))) {
        return null;
    }
    return window;
}
function createWindowsAdapter(electronModule = loadElectronModule()) {
    return {
        kind: 'win',
        getWindowById(windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                const window = getBrowserWindow(electronModule, windowId);
                return window ? toWindowInfo(window) : null;
            });
        },
        focusWindow(windowId) {
            var _a, _b, _c, _d, _e;
            return __awaiter(this, void 0, void 0, function* () {
                if (!(electronModule === null || electronModule === void 0 ? void 0 : electronModule.app) || !(electronModule === null || electronModule === void 0 ? void 0 : electronModule.BrowserWindow)) {
                    return { success: false, stage: 'not_in_electron_main' };
                }
                const window = getBrowserWindow(electronModule, windowId);
                if (!window) {
                    return { success: false, stage: 'window_not_found', window_id: windowId };
                }
                try {
                    if ((_a = window.isMinimized) === null || _a === void 0 ? void 0 : _a.call(window)) {
                        (_b = window.restore) === null || _b === void 0 ? void 0 : _b.call(window);
                    }
                    if (!((_c = window.isVisible) === null || _c === void 0 ? void 0 : _c.call(window))) {
                        (_d = window.show) === null || _d === void 0 ? void 0 : _d.call(window);
                    }
                    window.focus();
                    if (((_e = window.isFocused) === null || _e === void 0 ? void 0 : _e.call(window)) === false) {
                        return Object.assign({ success: false, stage: 'focus_failed' }, toWindowInfo(window));
                    }
                    return Object.assign({ success: true }, toWindowInfo(window));
                }
                catch (_f) {
                    return Object.assign({ success: false, stage: 'focus_failed' }, toWindowInfo(window));
                }
            });
        },
    };
}
exports.createWindowsAdapter = createWindowsAdapter;
