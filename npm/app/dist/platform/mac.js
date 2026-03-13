"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMacAdapter = void 0;
const native_1 = require("./native");
function createMacAdapter() {
    return {
        kind: 'mac',
        getWindowById(windowId) {
            return (0, native_1.runNative)(['get-window-by-id', String(windowId)]);
        },
        focusWindow(windowId) {
            return (0, native_1.runNative)(['focus', String(windowId)]);
        },
    };
}
exports.createMacAdapter = createMacAdapter;
