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
var pkg = require("../package.json");
var axios_1 = require("axios");
var util_1 = require("./util");
var VodReportEvent;
(function (VodReportEvent) {
    VodReportEvent["report_apply"] = "report_apply";
    VodReportEvent["report_cos_upload"] = "report_cos_upload";
    VodReportEvent["report_commit"] = "report_commit";
})(VodReportEvent = exports.VodReportEvent || (exports.VodReportEvent = {}));
var ReqType;
(function (ReqType) {
    ReqType[ReqType["apply"] = 10001] = "apply";
    ReqType[ReqType["cos_upload"] = 20001] = "cos_upload";
    ReqType[ReqType["commit"] = 10002] = "commit";
})(ReqType || (ReqType = {}));
var VodReporter = /** @class */ (function () {
    function VodReporter(uploader, options) {
        // only partial data when created
        this.baseReportData = {
            version: pkg.version,
            platform: 3000,
            device: navigator.userAgent
        };
        this.reportUrl = "https://vodreport.qcloud.com/ugcupload_new";
        this.uploader = uploader;
        this.options = options;
        this.init();
    }
    VodReporter.prototype.init = function () {
        this.uploader.on(VodReportEvent.report_apply, this.onApply.bind(this));
        this.uploader.on(VodReportEvent.report_cos_upload, this.onCosUpload.bind(this));
        this.uploader.on(VodReportEvent.report_commit, this.onCommit.bind(this));
    };
    // ApplyUploadUGC
    VodReporter.prototype.onApply = function (reportObj) {
        try {
            var uploader = this.uploader;
            if (!uploader.videoFile) {
                return;
            }
            Object.assign(this.baseReportData, {
                appId: uploader.appId,
                fileSize: uploader.videoFile.size,
                fileName: uploader.videoFile.name,
                fileType: uploader.videoFile.type,
                vodSessionKey: uploader.vodSessionKey
            });
            var customReportData = {
                reqType: ReqType.apply,
                vodErrCode: 0,
                errMsg: "",
                reqTimeCost: Number(new Date()) - Number(reportObj.requestStartTime),
                reqTime: Number(reportObj.requestStartTime)
            };
            if (reportObj.err) {
                customReportData.vodErrCode = reportObj.err.code;
                customReportData.errMsg = reportObj.err.message;
            }
            if (reportObj.data) {
                this.baseReportData.cosRegion = reportObj.data.storageRegionV5;
            }
            this.report(customReportData);
        }
        catch (e) {
            console.error("onApply", e);
            if (util_1.default.isTest) {
                throw e;
            }
        }
    };
    // upload to cos
    VodReporter.prototype.onCosUpload = function (reportObj) {
        try {
            var customReportData = {
                reqType: ReqType.cos_upload,
                cosErrCode: "",
                errMsg: "",
                reqTimeCost: Number(new Date()) - Number(reportObj.requestStartTime),
                reqTime: Number(reportObj.requestStartTime)
            };
            if (reportObj.err) {
                customReportData.cosErrCode = reportObj.err.error.Code;
                customReportData.errMsg = JSON.stringify(reportObj.err);
            }
            this.report(customReportData);
        }
        catch (e) {
            console.error("onCosUpload", e);
            if (util_1.default.isTest) {
                throw e;
            }
        }
    };
    // CommitUploadUGC
    VodReporter.prototype.onCommit = function (reportObj) {
        try {
            var customReportData = {
                reqType: ReqType.commit,
                vodErrCode: 0,
                errMsg: "",
                reqTimeCost: Number(new Date()) - Number(reportObj.requestStartTime),
                reqTime: Number(reportObj.requestStartTime)
            };
            if (reportObj.err) {
                customReportData.vodErrCode = reportObj.err.code;
                customReportData.errMsg = reportObj.err.message;
            }
            if (reportObj.data) {
                this.baseReportData.fileId = reportObj.data.fileId;
            }
            this.report(customReportData);
        }
        catch (e) {
            console.error("onCommit", e);
            if (util_1.default.isTest) {
                throw e;
            }
        }
    };
    VodReporter.prototype.report = function (reportData) {
        reportData = __assign({}, this.baseReportData, reportData);
        this.send(reportData);
    };
    VodReporter.prototype.send = function (reportData) {
        axios_1.default.post(this.reportUrl, reportData);
    };
    return VodReporter;
}());
exports.VodReporter = VodReporter;
//# sourceMappingURL=vod_reporter.js.map