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
var vod_reporter_1 = require("./vod_reporter");
var TcVod = /** @class */ (function () {
    function TcVod(params) {
        this.allowReport = true; // report sdk status to tencent cloud
        this.getSignature = params.getSignature;
        if (params.allowReport !== void 0) {
            this.allowReport = params.allowReport;
        }
        this.appId = params.appId;
        this.reportId = params.reportId;
    }
    TcVod.prototype.upload = function (params) {
        var uploaderParams = __assign({ getSignature: this.getSignature, appId: this.appId, reportId: this.reportId }, params);
        var uploader = new uploader_1.default(uploaderParams);
        if (this.allowReport) {
            this.initReporter(uploader);
        }
        uploader.start();
        return uploader;
    };
    // report to official report system
    TcVod.prototype.initReporter = function (uploader) {
        new vod_reporter_1.VodReporter(uploader);
    };
    return TcVod;
}());
exports.default = TcVod;
//# sourceMappingURL=tc_vod.js.map