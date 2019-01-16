"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isFile(v) {
    return Object.prototype.toString.call(v) == "[object File]";
}
function isFunction(v) {
    return typeof v === 'function';
}
function isString(v) {
    return typeof v === 'string';
}
function noop() { }
exports.default = {
    isFile: isFile,
    isFunction: isFunction,
    isString: isString,
    noop: noop,
};
//# sourceMappingURL=util.js.map