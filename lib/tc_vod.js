"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var uploader_1 = require("./uploader");
var TcVod = /** @class */ (function () {
    function TcVod(params) {
        this.getSignature = params.getSignature;
    }
    TcVod.prototype.upload = function (params) {
        params = __assign({ getSignature: this.getSignature }, params);
        var uploader = new uploader_1.default(params);
        uploader.start();
        return uploader;
    };
    return TcVod;
}());
exports.default = TcVod;
//# sourceMappingURL=tc_vod.js.map