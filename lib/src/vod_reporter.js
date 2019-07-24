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
    VodReportEvent["report_done"] = "report_done";
})(VodReportEvent = exports.VodReportEvent || (exports.VodReportEvent = {}));
var ReqType;
(function (ReqType) {
    ReqType[ReqType["apply"] = 10001] = "apply";
    ReqType[ReqType["cos_upload"] = 20001] = "cos_upload";
    ReqType[ReqType["commit"] = 10002] = "commit";
    ReqType[ReqType["done"] = 40001] = "done";
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
        this.uploader.on(VodReportEvent.report_done, this.onDone.bind(this));
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
                vodSessionKey: uploader.vodSessionKey,
                reqKey: uploader.reqKey,
                reportId: uploader.reportId
            });
            var customReportData = {
                reqType: ReqType.apply,
                errCode: 0,
                vodErrCode: 0,
                errMsg: "",
                reqTimeCost: Number(new Date()) - Number(reportObj.requestStartTime),
                reqTime: Number(reportObj.requestStartTime)
            };
            if (reportObj.err) {
                customReportData.errCode = 1;
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
                errCode: 0,
                cosErrCode: "",
                errMsg: "",
                reqTimeCost: Number(new Date()) - Number(reportObj.requestStartTime),
                reqTime: Number(reportObj.requestStartTime)
            };
            if (reportObj.err) {
                customReportData.errCode = 1;
                customReportData.cosErrCode = reportObj.err.error
                    ? reportObj.err.error.Code
                    : reportObj.err;
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
                errCode: 0,
                vodErrCode: 0,
                errMsg: "",
                reqTimeCost: Number(new Date()) - Number(reportObj.requestStartTime),
                reqTime: Number(reportObj.requestStartTime)
            };
            if (reportObj.err) {
                customReportData.errCode = 1;
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
    VodReporter.prototype.onDone = function (reportObj) {
        try {
            var customReportData = {
                reqType: ReqType.done,
                errCode: reportObj.err && reportObj.err.code,
                reqTimeCost: Number(new Date()) - Number(reportObj.requestStartTime),
                reqTime: Number(reportObj.requestStartTime)
            };
            this.report(customReportData);
        }
        catch (e) {
            console.error("onDone", e);
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
        if (util_1.default.isDev || util_1.default.isTest) {
            console.log("send reportData", reportData);
            return;
        }
        axios_1.default.post(this.reportUrl, reportData);
    };
    return VodReporter;
}());
exports.VodReporter = VodReporter;
//# sourceMappingURL=vod_reporter.js.map