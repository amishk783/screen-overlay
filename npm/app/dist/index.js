"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.focusWindow = exports.getWindowById = void 0;
const platform_1 = require("./platform");
const adapter = (0, platform_1.selectAdapter)();
/**
 * Returns the window matching the given `windowId`, or `null` if not found.
 */
function getWindowById(windowId) {
    return adapter.getWindowById(windowId);
}
exports.getWindowById = getWindowById;
/**
 * Focuses the window matching the given `windowId`.
 */
function focusWindow(windowId) {
    return adapter.focusWindow(windowId);
}
exports.focusWindow = focusWindow;
