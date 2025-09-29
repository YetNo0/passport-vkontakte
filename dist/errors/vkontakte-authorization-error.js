"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VkontakteAuthorizationError = void 0;
class VkontakteAuthorizationError extends Error {
    constructor(message, type, code = "server_error", status = 500) {
        var _a;
        super(message);
        this.name = "VkontakteAuthorizationError";
        this.type = type;
        this.code = code;
        this.status = status;
        (_a = Error.captureStackTrace) === null || _a === void 0 ? void 0 : _a.call(Error, this, VkontakteAuthorizationError);
    }
}
exports.VkontakteAuthorizationError = VkontakteAuthorizationError;
