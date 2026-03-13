"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWindowsAdapter = void 0;
const native_1 = require("./native");
function createWindowsAdapter() {
    return {
        kind: 'win',
        getWindowById(windowId) {
            return (0, native_1.runNative)(['get-window-by-id', String(windowId)]);
        },
        focusWindow(windowId) {
            return (0, native_1.runNative)(['focus', String(windowId)]);
        },
    };
}
exports.createWindowsAdapter = createWindowsAdapter;
