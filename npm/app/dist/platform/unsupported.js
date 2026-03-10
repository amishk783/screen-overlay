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
exports.createUnsupportedAdapter = void 0;
function unsupportedError(platform) {
    return new Error(`cross-window: unsupported platform "${platform}". This package currently supports macOS and Windows only.`);
}
function createUnsupportedAdapter(platform) {
    return {
        kind: 'unsupported',
        getWindowById(_windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                throw unsupportedError(platform);
            });
        },
        focusWindow(_windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                throw unsupportedError(platform);
            });
        },
    };
}
exports.createUnsupportedAdapter = createUnsupportedAdapter;
