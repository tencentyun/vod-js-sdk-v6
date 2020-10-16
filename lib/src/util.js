"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HOST = void 0;
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
function getUnix() {
    return Math.floor(Date.now() / 1000);
}
var CLIENT_ERROR_CODE;
(function (CLIENT_ERROR_CODE) {
    CLIENT_ERROR_CODE[CLIENT_ERROR_CODE["UPLOAD_FAIL"] = 1] = "UPLOAD_FAIL";
})(CLIENT_ERROR_CODE || (CLIENT_ERROR_CODE = {}));
var HOST;
(function (HOST) {
    HOST["MAIN"] = "vod2.qcloud.com";
    HOST["BACKUP"] = "vod2.dnsv1.com";
})(HOST = exports.HOST || (exports.HOST = {}));
exports.default = {
    isFile: isFile,
    isFunction: isFunction,
    isString: isString,
    noop: noop,
    delay: delay,
    getUnix: getUnix,
    isTest: process.env.NODE_ENV === "test",
    isDev: process.env.NODE_ENV === "development",
    CLIENT_ERROR_CODE: CLIENT_ERROR_CODE
};
//# sourceMappingURL=util.js.map