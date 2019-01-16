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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var sha1 = require('js-sha1');
var COS = require('cos-js-sdk-v5');
var axios_1 = require("axios");
var util_1 = require("./util");
var Uploader = /** @class */ (function () {
    function Uploader(params) {
        this.allowAudio = false;
        this.applyRequestTimeout = 5000;
        this.applyRequestRetryCount = 3;
        this.commitRequestTimeout = 5000;
        this.commitRequestRetryCount = 3;
        // video types
        this.videoTypes = [
            'WMV', 'WM', 'ASF', 'ASX',
            'RM', 'RMVB', 'RA', 'RAM',
            'MPG', 'MPEG', 'MPE', 'VOB', 'DAT',
            'MOV', '3GP', 'MP4', 'MP4V', 'M4V', 'MKV', 'AVI', 'FLV', 'F4V' // other types
        ];
        // audio types
        this.audioTypes = ['MP3', 'WMA', 'WAV', 'ASF', 'AU', 'SND', 'RAW', 'AFC', 'ACC'];
        // pic types
        this.imageTypes = [
            'JPG', 'JPEG', 'JPE',
            'PSD',
            'SVG', 'SVGZ',
            'TIFF', 'TIF',
            'BMP', 'GIF', 'PNG'
        ];
        this.validateInitParams(params);
        this.videoFile = params.videoFile;
        this.getSignature = params.getSignature;
        this.progress = params.progress || util_1.default.noop;
        this.coverProgress = params.coverProgress || util_1.default.noop;
        this.cosSuccess = params.cosSuccess || util_1.default.noop;
        this.cosCoverSuccess = params.cosCoverSuccess || util_1.default.noop;
        this.allowAudio = params.allowAudio;
        this.videoName = params.videoName;
        this.coverFile = params.coverFile;
        this.isTempSignature = params.isTempSignature;
        this.fileId = params.fileId;
        this.genFileInfo();
        this.validateUploadParams();
    }
    // set storage
    Uploader.prototype.setStorage = function (name, value) {
        if (!name) {
            return;
        }
        if (this.getStorageNum() > 5) {
            return;
        }
        var cname = 'webugc_' + sha1(name);
        try {
            localStorage.setItem(cname, value);
        }
        catch (e) { }
    };
    // get storage
    Uploader.prototype.getStorage = function (name) {
        if (!name) {
            return;
        }
        var cname = 'webugc_' + sha1(name);
        var result = null;
        try {
            result = localStorage.getItem(cname);
        }
        catch (e) { }
        return result;
    };
    // delete storage
    Uploader.prototype.delStorage = function (name) {
        if (!name) {
            return;
        }
        var cname = 'webugc_' + sha1(name);
        try {
            localStorage.removeItem(cname);
        }
        catch (e) { }
    };
    // get all `webugc` prefix key
    Uploader.prototype.getStorageNum = function () {
        var num = 0;
        try {
            var reg = /^webugc_[0-9a-fA-F]{40}$/;
            for (var i = 0; i < localStorage.length; i++) {
                if (reg.test(localStorage.key(i))) {
                    num++;
                }
            }
        }
        catch (e) { }
        return num;
    };
    // validate init params
    Uploader.prototype.validateInitParams = function (params) {
        if (!util_1.default.isFunction(params.getSignature)) {
            throw new Error('getSignature must be a function');
        }
        if (params.videoFile && !util_1.default.isFile(params.videoFile)) {
            throw new Error('videoFile must be a File');
        }
        if (params.cosSuccess && !util_1.default.isFunction(params.cosSuccess)) {
            throw new Error('success must be a function');
        }
        if (params.progress && !util_1.default.isFunction(params.progress)) {
            throw new Error('progress must be a function');
        }
    };
    // validate when init done
    Uploader.prototype.validateUploadParams = function () {
        var allowVideoTypes = this.videoTypes;
        //视频格式过滤
        if (this.allowAudio) {
            allowVideoTypes = allowVideoTypes.concat(this.audioTypes);
        }
        if (this.videoInfo && allowVideoTypes.indexOf(this.videoInfo.type.toUpperCase()) == -1) {
            console.log("Video type is wrong. Please infer to https://cloud.tencent.com/document/product/266/2834#.E9.9F.B3.E8.A7.86.E9.A2.91.E4.B8.8A.E4.BC.A0");
        }
        if (this.coverInfo && this.imageTypes.indexOf(this.coverInfo.type.toUpperCase()) == -1) {
            console.log("Image type is wrong. Please infer to https://cloud.tencent.com/document/product/266/2834#.E9.9F.B3.E8.A7.86.E9.A2.91.E4.B8.8A.E4.BC.A0");
        }
    };
    Uploader.prototype.genFileInfo = function () {
        //视频
        var videoFile = this.videoFile;
        if (videoFile) {
            var lastDotIndex = videoFile.name.lastIndexOf('.');
            var videoName = '';
            //有指定视频名称，则用该名称
            if (this.videoName) {
                if (!util_1.default.isString(this.videoName)) {
                    throw new Error('videoName must be a string');
                }
                else if (/[:*?<>\"\\/|]/g.test(this.videoName)) {
                    throw new Error('Cant use these chars in filename: \\ / : * ? " < > |');
                }
                else {
                    videoName = this.videoName;
                }
            }
            else { //不然，则用上传文件的name
                videoName = videoFile.name.substring(0, lastDotIndex);
            }
            this.videoInfo = {
                name: videoName,
                type: videoFile.name.substring(lastDotIndex + 1).toLowerCase(),
                size: videoFile.size
            };
            this.storageName = videoFile.name + '_' + videoFile.size;
        }
        //封面
        var coverFile = this.coverFile;
        if (coverFile) {
            var coverName = coverFile.name;
            var coverLastDotIndex = coverName.lastIndexOf('.');
            this.coverInfo = {
                name: coverName.substring(0, coverLastDotIndex),
                type: coverName.substring(coverLastDotIndex + 1).toLowerCase(),
                size: coverFile.size
            };
        }
    };
    ;
    Uploader.prototype.applyUploadUGC = function (signature, retryCount) {
        if (retryCount === void 0) { retryCount = 0; }
        return __awaiter(this, void 0, void 0, function () {
            function whenError() {
                if (self.applyRequestRetryCount == retryCount) {
                    throw new Error("apply upload failed");
                }
                return self.applyUploadUGC(signature, retryCount--);
            }
            var self, sendParam, videoInfo, coverInfo, vodSessionKey, response, e_1, applyResult, vodSessionKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        videoInfo = this.videoInfo;
                        coverInfo = this.coverInfo;
                        if (videoInfo) {
                            vodSessionKey = this.getStorage(this.storageName);
                            if (vodSessionKey) {
                                sendParam = {
                                    'signature': signature,
                                    'vodSessionKey': vodSessionKey
                                };
                            }
                            else {
                                sendParam = {
                                    'signature': signature,
                                    'videoName': videoInfo.name,
                                    'videoType': videoInfo.type,
                                    'videoSize': videoInfo.size
                                };
                                if (coverInfo) { //有封面，则加上封面的参数（视频和封面一起上传）
                                    sendParam.coverName = coverInfo.name;
                                    sendParam.coverType = coverInfo.type;
                                    sendParam.coverSize = coverInfo.size;
                                }
                            }
                        }
                        else if (this.fileId && coverInfo) { //指定fileid和封面，则一起上传
                            sendParam = {
                                'signature': signature,
                                'fileId': this.fileId,
                                'coverName': coverInfo.name,
                                'coverType': coverInfo.type,
                                'coverSize': coverInfo.size
                            };
                        }
                        else {
                            throw ('Wrong params, please check and try again');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.post('https://vod2.qcloud.com/v3/index.php?Action=ApplyUploadUGC', sendParam, {
                                timeout: this.applyRequestTimeout,
                            })];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        return [2 /*return*/, whenError()];
                    case 4:
                        applyResult = response.data;
                        if (applyResult.code == 0) {
                            vodSessionKey = applyResult.data.vodSessionKey;
                            if (this.videoFile) {
                                this.setStorage(this.storageName, vodSessionKey);
                            }
                            return [2 /*return*/, applyResult.data];
                        }
                        else {
                            // 错误码 https://user-images.githubusercontent.com/1147375/51222454-bf6ef280-1978-11e9-8e33-1b0fdb2fe200.png
                            if (applyResult.code === 10005) {
                                this.delStorage(this.storageName);
                            }
                            return [2 /*return*/, whenError()];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Uploader.prototype.uploadToCos = function (applyData) {
        return __awaiter(this, void 0, void 0, function () {
            var self, cosParam, cos, uploadCosParams, cosVideoParam, cosCoverParam, uploadPromises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        cosParam = {
                            bucket: applyData.storageBucket + '-' + applyData.storageAppId,
                            region: applyData.storageRegionV5,
                            secretId: applyData.tempCertificate.secretId,
                            secretKey: applyData.tempCertificate.secretKey,
                            token: applyData.tempCertificate.token,
                            expiredTime: applyData.tempCertificate.expiredTime
                        };
                        cos = new COS({
                            getAuthorization: function (options, callback) {
                                callback({
                                    TmpSecretId: cosParam.secretId,
                                    TmpSecretKey: cosParam.secretKey,
                                    XCosSecurityToken: cosParam.token,
                                    ExpiredTime: cosParam.expiredTime
                                });
                            }
                        });
                        this.cos = cos;
                        uploadCosParams = [];
                        if (this.videoFile) {
                            cosVideoParam = __assign({}, cosParam, { file: this.videoFile, key: applyData.video.storagePath, onProgress: function (progressData) {
                                    self.progress(progressData);
                                }, onSuccess: function (data) {
                                    self.cosSuccess(data);
                                }, TaskReady: function (taskId) {
                                    self.taskId = taskId;
                                } });
                            uploadCosParams.push(cosVideoParam);
                        }
                        if (this.coverFile) {
                            cosCoverParam = __assign({}, cosParam, { file: this.coverFile, key: applyData.cover.storagePath, onProgress: function (progressData) {
                                    self.coverProgress(progressData);
                                }, onSuccess: function (data) {
                                    self.cosCoverSuccess(data);
                                }, TaskReady: util_1.default.noop });
                            uploadCosParams.push(cosCoverParam);
                        }
                        uploadPromises = uploadCosParams.map(function (uploadCosParam) {
                            return new Promise(function (resolve, reject) {
                                cos.sliceUploadFile({
                                    Bucket: uploadCosParam.bucket,
                                    Region: uploadCosParam.region,
                                    Key: uploadCosParam.key,
                                    Body: uploadCosParam.file,
                                    TaskReady: uploadCosParam.TaskReady,
                                    onProgress: uploadCosParam.onProgress,
                                }, function (err, data) {
                                    if (!err) {
                                        uploadCosParam.onSuccess(data);
                                        resolve();
                                    }
                                    else {
                                        reject(err);
                                    }
                                });
                            });
                        });
                        return [4 /*yield*/, Promise.all(uploadPromises)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Uploader.prototype.commitUploadUGC = function (signature, vodSessionKey, retryCount) {
        if (retryCount === void 0) { retryCount = 0; }
        return __awaiter(this, void 0, void 0, function () {
            function whenError() {
                if (self.commitRequestRetryCount == retryCount) {
                    throw new Error('commit upload failed');
                }
                return self.commitUploadUGC(signature, vodSessionKey, retryCount);
            }
            var self, response, e_2, commitResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        if (this.videoFile) {
                            this.delStorage(this.storageName);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.post('https://vod2.qcloud.com/v3/index.php?Action=CommitUploadUGC', {
                                'signature': signature,
                                'vodSessionKey': vodSessionKey
                            }, {
                                timeout: this.commitRequestTimeout,
                            })];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        return [2 /*return*/, whenError()];
                    case 4:
                        commitResult = response.data;
                        if (commitResult.code == 0) {
                            return [2 /*return*/, commitResult.data];
                        }
                        else {
                            return [2 /*return*/, whenError()];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Uploader.prototype.start = function () {
        this.donePromise = this._start();
    };
    Uploader.prototype._start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var signature, applyData, newSignature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSignature()];
                    case 1:
                        signature = _a.sent();
                        return [4 /*yield*/, this.applyUploadUGC(signature)];
                    case 2:
                        applyData = _a.sent();
                        return [4 /*yield*/, this.uploadToCos(applyData)];
                    case 3:
                        _a.sent();
                        newSignature = signature;
                        if (!this.isTempSignature) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getSignature()];
                    case 4:
                        // get signature every time when finish if sig is temp.
                        newSignature = _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.commitUploadUGC(newSignature, applyData.vodSessionKey)];
                    case 6: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Uploader.prototype.done = function () {
        return this.donePromise;
    };
    Uploader.prototype.cancel = function () {
        this.cos.cancelTask(this.taskId);
    };
    return Uploader;
}());
exports.default = Uploader;
//# sourceMappingURL=uploader.js.map