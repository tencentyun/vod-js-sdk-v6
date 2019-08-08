const sha1 = require("js-sha1");
const COS = require("cos-js-sdk-v5");

import { EventEmitter } from "events";
import axios from "axios";
import util from "./util";
import { vodError } from "./types";
import { VodReportEvent } from "./vod_reporter";
import * as uuidv4 from "uuid/v4";

export type IGetSignature = () => Promise<string>;
export interface TcVodFileInfo {
  name: string;
  type: string;
  size: number;
}

export enum UploaderEvent {
  video_progress = "video_progress",
  media_progress = "media_progress",

  video_upload = "video_upload",
  media_upload = "media_upload",

  cover_progress = "cover_progress",
  cover_upload = "cover_upload"
}

interface IApplyUpload {
  signature: string;
  vodSessionKey?: string;

  videoName?: string;
  videoType?: string;
  videoSize?: number;

  coverName?: string;
  coverType?: string;
  coverSize?: number;

  fileId?: string;
}

interface IApplyData {
  video: {
    storageSignature: string;
    storagePath: string;
  };
  cover?: {
    storageSignature: string;
    storagePath: string;
  };
  storageAppId: number;
  storageBucket: string;
  storageRegion: string;
  storageRegionV5: string;
  domain: string;
  vodSessionKey: string;
  tempCertificate: {
    secretId: string;
    secretKey: string;
    token: string;
    expiredTime: number;
  };
  appId: number;
  timestamp: number;
  StorageRegionV5: string;
}

export interface UploaderOptions {
  getSignature: IGetSignature;

  videoFile?: File;
  mediaFile?: File;
  coverFile?: File;

  videoName?: string;
  mediaName?: string;
  fileId?: string;

  appId?: number;
  reportId?: string;

  applyRequestTimeout?: number;
  commitRequestTimeout?: number;
  retryDelay?: number;
}

class Uploader extends EventEmitter implements UploaderOptions {
  getSignature: IGetSignature;
  videoFile: File;
  videoInfo: TcVodFileInfo;
  coverFile: File;
  coverInfo: TcVodFileInfo;

  cos: any;
  taskId: string;

  videoName: string;
  sessionName: string = "";
  vodSessionKey: string = "";
  appId: number = 0;
  fileId: string;

  reqKey: string = uuidv4();
  reportId: string = "";

  donePromise: Promise<any>;

  // apply 请求的超时时间
  applyRequestTimeout = 5000;
  applyRequestRetryCount = 3;

  // commit 请求的超时时间
  commitRequestTimeout = 5000;
  commitRequestRetryCount = 3;

  // 重试请求的等待时间
  retryDelay = 1000;

  constructor(params: UploaderOptions) {
    super();
    this.validateInitParams(params);

    this.videoFile = params.mediaFile || params.videoFile;
    this.getSignature = params.getSignature;

    this.videoName = params.mediaName || params.videoName;
    this.coverFile = params.coverFile;
    this.fileId = params.fileId;

    this.applyRequestTimeout =
      params.applyRequestTimeout || this.applyRequestTimeout;
    this.commitRequestTimeout =
      params.commitRequestTimeout || this.commitRequestTimeout;
    this.retryDelay = params.retryDelay || this.retryDelay;

    // custom report metrics
    this.appId = params.appId || this.appId;
    this.reportId = params.reportId || this.reportId;

    this.genFileInfo();
  }

  // set storage
  setStorage(name: string, value: string): void {
    if (!name) {
      return;
    }

    const cname = "webugc_" + sha1(name);
    try {
      localStorage.setItem(cname, value);
    } catch (e) {}
  }

  // get storage
  getStorage(name: string): string {
    if (!name) {
      return;
    }
    const cname = "webugc_" + sha1(name);
    let result = null;
    try {
      result = localStorage.getItem(cname);
    } catch (e) {}

    return result;
  }

  // delete storage
  delStorage(name: string): void {
    if (!name) {
      return;
    }
    const cname = "webugc_" + sha1(name);
    try {
      localStorage.removeItem(cname);
    } catch (e) {}
  }

  // validate init params
  validateInitParams(params: UploaderOptions): void {
    if (!util.isFunction(params.getSignature)) {
      throw new Error("getSignature must be a function");
    }
    if (params.videoFile && !util.isFile(params.videoFile)) {
      throw new Error("videoFile must be a File");
    }
  }

  genFileInfo(): void {
    // video file info
    const videoFile = this.videoFile;
    if (videoFile) {
      const lastDotIndex = videoFile.name.lastIndexOf(".");
      let videoName = "";
      // if specified, use it.
      if (this.videoName) {
        if (!util.isString(this.videoName)) {
          throw new Error("mediaName must be a string");
        } else if (/[:*?<>\"\\/|]/g.test(this.videoName)) {
          throw new Error(
            'Cant use these chars in filename: \\ / : * ? " < > |'
          );
        } else {
          videoName = this.videoName;
        }
      } else {
        // else use the meta info of file
        videoName = videoFile.name.substring(0, lastDotIndex);
      }
      this.videoInfo = {
        name: videoName,
        type: videoFile.name.substring(lastDotIndex + 1).toLowerCase(),
        size: videoFile.size
      };
      this.sessionName += `${videoFile.name}_${videoFile.size};`;
    }

    // cover file info
    const coverFile = this.coverFile;
    if (coverFile) {
      const coverName = coverFile.name;
      const coverLastDotIndex = coverName.lastIndexOf(".");
      this.coverInfo = {
        name: coverName.substring(0, coverLastDotIndex),
        type: coverName.substring(coverLastDotIndex + 1).toLowerCase(),
        size: coverFile.size
      };
      this.sessionName += `${coverFile.name}_${coverFile.size};`;
    }
  }

  async applyUploadUGC(retryCount: number = 0): Promise<IApplyData> {
    const self = this;

    const signature = await this.getSignature();

    let sendParams: IApplyUpload;
    const videoInfo = this.videoInfo;
    const coverInfo = this.coverInfo;
    const vodSessionKey =
      this.vodSessionKey || this.getStorage(this.sessionName);

    // resume from break point
    if (vodSessionKey) {
      sendParams = {
        signature: signature,
        vodSessionKey: vodSessionKey
      };
    } else if (videoInfo) {
      sendParams = {
        signature: signature,
        videoName: videoInfo.name,
        videoType: videoInfo.type,
        videoSize: videoInfo.size
      };
      if (coverInfo) {
        // upload video together with cover
        sendParams.coverName = coverInfo.name;
        sendParams.coverType = coverInfo.type;
        sendParams.coverSize = coverInfo.size;
      }
    } else if (this.fileId && coverInfo) {
      // alter cover
      sendParams = {
        signature: signature,
        fileId: this.fileId,
        coverName: coverInfo.name,
        coverType: coverInfo.type,
        coverSize: coverInfo.size
      };
    } else {
      throw "Wrong params, please check and try again";
    }
    const requestStartTime = new Date();

    async function whenError(err?: vodError): Promise<any> {
      self.emit(VodReportEvent.report_apply, {
        err: err,
        requestStartTime: requestStartTime
      });
      self.delStorage(self.sessionName);
      if (self.applyRequestRetryCount == retryCount) {
        if (err) {
          throw err;
        }
        throw new Error(`apply upload failed`);
      }
      await util.delay(self.retryDelay);
      return self.applyUploadUGC(retryCount + 1);
    }

    let response;
    try {
      response = await axios.post(
        "https://vod2.qcloud.com/v3/index.php?Action=ApplyUploadUGC",
        sendParams,
        {
          timeout: this.applyRequestTimeout,
          withCredentials: false
        }
      );
    } catch (e) {
      return whenError(e);
    }

    const applyResult = response.data;

    // all err code https://user-images.githubusercontent.com/1147375/51222454-bf6ef280-1978-11e9-8e33-1b0fdb2fe200.png
    if (applyResult.code == 0) {
      const applyData = applyResult.data as IApplyData;
      const vodSessionKey = applyData.vodSessionKey;
      this.setStorage(this.sessionName, vodSessionKey);
      this.vodSessionKey = vodSessionKey;
      this.appId = applyData.appId;

      this.emit(VodReportEvent.report_apply, {
        data: applyData,
        requestStartTime: requestStartTime
      });
      return applyData;
    } else {
      // return the apply result error info
      const err: vodError = new Error(applyResult.message);
      err.code = applyResult.code;

      return whenError(err);
    }
  }

  async uploadToCos(applyData: IApplyData) {
    const self = this;

    const cosParam = {
      bucket: applyData.storageBucket + "-" + applyData.storageAppId,
      region: applyData.storageRegionV5
    };

    const cos = new COS({
      getAuthorization: async function(options: object, callback: Function) {
        const applyData = await self.applyUploadUGC();

        callback({
          TmpSecretId: applyData.tempCertificate.secretId,
          TmpSecretKey: applyData.tempCertificate.secretKey,
          XCosSecurityToken: applyData.tempCertificate.token,
          ExpiredTime: applyData.tempCertificate.expiredTime
        });
      }
    });
    this.cos = cos;

    const uploadCosParams = [];

    if (this.videoFile) {
      const cosVideoParam = {
        ...cosParam,
        file: this.videoFile,
        key: applyData.video.storagePath,
        onProgress: function(data: any) {
          self.emit(UploaderEvent.video_progress, data);
          self.emit(UploaderEvent.media_progress, data);
        },
        onUpload: function(data: any) {
          self.emit(UploaderEvent.video_upload, data);
          self.emit(UploaderEvent.media_upload, data);
        },
        onTaskReady: function(taskId: string) {
          self.taskId = taskId;
        }
      };
      uploadCosParams.push(cosVideoParam);
    }

    if (this.coverFile) {
      const cosCoverParam = {
        ...cosParam,
        file: this.coverFile,
        key: applyData.cover.storagePath,
        onProgress: function(data: any) {
          self.emit(UploaderEvent.cover_progress, data);
        },
        onUpload: function(data: any) {
          self.emit(UploaderEvent.cover_upload, data);
        },
        onTaskReady: util.noop
      };
      uploadCosParams.push(cosCoverParam);
    }
    const requestStartTime = new Date();
    const uploadPromises = uploadCosParams.map(uploadCosParam => {
      return new Promise<void>(function(resolve, reject) {
        cos.sliceUploadFile(
          {
            Bucket: uploadCosParam.bucket,
            Region: uploadCosParam.region,
            Key: uploadCosParam.key,
            Body: uploadCosParam.file,
            onTaskReady: uploadCosParam.onTaskReady,
            onProgress: uploadCosParam.onProgress
          },
          function(err: any, data: any) {
            // only report video file
            if (uploadCosParam.file === self.videoFile) {
              self.emit(VodReportEvent.report_cos_upload, {
                err: err,
                requestStartTime: requestStartTime
              });
            }
            if (!err) {
              uploadCosParam.onUpload(data);
              return resolve();
            }
            self.delStorage(self.sessionName);
            reject(err);
          }
        );
      });
    });

    return await Promise.all(uploadPromises);
  }

  async commitUploadUGC(retryCount: number = 0) {
    const self = this;

    const signature = await this.getSignature();
    this.delStorage(this.sessionName);
    const vodSessionKey = this.vodSessionKey;

    const requestStartTime = new Date();
    async function whenError(err?: vodError): Promise<any> {
      self.emit(VodReportEvent.report_commit, {
        err: err,
        requestStartTime: requestStartTime
      });
      if (self.commitRequestRetryCount == retryCount) {
        if (err) {
          throw err;
        }
        throw new Error("commit upload failed");
      }
      await util.delay(self.retryDelay);
      return self.commitUploadUGC(retryCount + 1);
    }

    let response;
    try {
      response = await axios.post(
        "https://vod2.qcloud.com/v3/index.php?Action=CommitUploadUGC",
        {
          signature: signature,
          vodSessionKey: vodSessionKey
        },
        {
          timeout: this.commitRequestTimeout,
          withCredentials: false
        }
      );
    } catch (e) {
      return whenError(e);
    }

    const commitResult = response.data;

    if (commitResult.code == 0) {
      this.emit(VodReportEvent.report_commit, {
        data: commitResult.data,
        requestStartTime: requestStartTime
      });
      return commitResult.data;
    } else {
      const err: vodError = new Error(commitResult.message);
      err.code = commitResult.code;
      return whenError(err);
    }
  }

  start() {
    const requestStartTime = new Date();

    this.donePromise = this._start()
      .then(doneResult => {
        this.emit(VodReportEvent.report_done, {
          err: { code: 0 },
          requestStartTime: requestStartTime
        });
        return doneResult;
      })
      .catch(err => {
        this.emit(VodReportEvent.report_done, {
          err: {
            code: (err && err.code) || util.CLIENT_ERROR_CODE.UPLOAD_FAIL
          },
          requestStartTime: requestStartTime
        });
        throw err;
      });
  }

  async _start() {
    const applyData = await this.applyUploadUGC();

    await this.uploadToCos(applyData);

    return await this.commitUploadUGC();
  }

  done() {
    return this.donePromise;
  }

  cancel() {
    this.cos.cancelTask(this.taskId);
  }
}

export default Uploader;
