"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isFile(v) {
    return Object.prototype.toString.call(v) == "[object File]";
}
function isFunction(v) {
    return typeof v === "function";
}
function isString(v) {
    return typeof v === "string";
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function noop() { }
function delay(ms) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, ms);
    });
}
exports.default = {
    isFile: isFile,
    isFunction: isFunction,
    isString: isString,
    noop: noop,
    delay: delay
};
//# sourceMappingURL=util.js.map