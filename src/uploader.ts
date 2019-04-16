const sha1 = require('js-sha1')
const COS = require('cos-js-sdk-v5')

import {EventEmitter} from 'events';
import axios from 'axios'
import util from './util'
import { vodError } from './types';
export type IGetSignature = () => Promise<string>
export type TcVodFileInfo = { name: string, type: string, size: number }

export enum UploaderEvent {
  video_progress = 'video_progress',
  video_upload = 'video_upload',
  cover_progress = 'cover_progress',
  cover_upload = 'cover_upload',
}

interface IApplyUpload {
  signature: string,
  vodSessionKey?: string,

  videoName?: string;
  videoType?: string;
  videoSize?: number;

  coverName?: string;
  coverType?: string;
  coverSize?: number;

  fileId?: string;
}

interface IApplyData {
  "video": {
    "storageSignature": string,
    "storagePath": string
  },
  "cover"?: {
    "storageSignature": string,
    "storagePath": string
  },
  "storageAppId": number,
  "storageBucket": string,
  "storageRegion": string,
  "storageRegionV5": string,
  "domain": string,
  "vodSessionKey": string,
  "tempCertificate": {
    "secretId": string,
    "secretKey": string,
    "token": string,
    "expiredTime": number
  },
  "appId": number,
  "timestamp": number,
  "StorageRegionV5": string
}

export interface IUploader {
  getSignature: IGetSignature;

  videoFile?: File,
  coverFile?: File,

  videoName?: string,
  fileId?: string,
}

class Uploader extends EventEmitter implements IUploader {
  getSignature: IGetSignature;
  videoFile: File;
  videoInfo: TcVodFileInfo;
  coverFile: File;
  coverInfo: TcVodFileInfo;

  cos: any;
  taskId: string;

  videoName: string;
  sessionName: string = '';
  fileId: string;

  donePromise: Promise<any>;

  applyRequestTimeout = 5000;
  applyRequestRetryCount = 3;

  commitRequestTimeout = 5000;
  commitRequestRetryCount = 3;
  retryDelay = 1000;

  constructor(params: IUploader) {
    super();
    this.validateInitParams(params);

    this.videoFile = params.videoFile;
    this.getSignature = params.getSignature;

    this.videoName = params.videoName;
    this.coverFile = params.coverFile;
    this.fileId = params.fileId;

    this.genFileInfo()
  }

  // set storage
  setStorage(name: string, value: string) {
    if (!name) {
      return;
    }

    const cname = 'webugc_' + sha1(name);
    try {
      localStorage.setItem(cname, value);
    } catch (e) { }
  }

  // get storage
  getStorage(name: string) {
    if (!name) {
      return;
    }
    const cname = 'webugc_' + sha1(name);
    let result = null;
    try {
      result = localStorage.getItem(cname);
    } catch (e) { }

    return result;
  }

  // delete storage
  delStorage(name: string) {
    if (!name) {
      return;
    }
    const cname = 'webugc_' + sha1(name);
    try {
      localStorage.removeItem(cname);
    } catch (e) { }
  }

  // validate init params
  validateInitParams(params: IUploader) {
    if (!util.isFunction(params.getSignature)) {
      throw new Error('getSignature must be a function');
    }
    if (params.videoFile && !util.isFile(params.videoFile)) {
      throw new Error('videoFile must be a File');
    }
  }

  genFileInfo() {
    // video file info
    const videoFile = this.videoFile;
    if (videoFile) {
      const lastDotIndex = videoFile.name.lastIndexOf('.');
      let videoName = '';
      // if specified, use it.
      if (this.videoName) {
        if (!util.isString(this.videoName)) {
          throw new Error('videoName must be a string');
        } else if (/[:*?<>\"\\/|]/g.test(this.videoName)) {
          throw new Error('Cant use these chars in filename: \\ / : * ? " < > |');
        } else {
          videoName = this.videoName;
        }
      } else { // else use the meta info of file
        videoName = videoFile.name.substring(0, lastDotIndex);
      }
      this.videoInfo = {
        name: videoName,
        type: videoFile.name.substring(lastDotIndex + 1).toLowerCase(),
        size: videoFile.size
      };
      this.sessionName += `${videoFile.name}_${videoFile.size};`
    }

    // cover file info
    const coverFile = this.coverFile;
    if (coverFile) {
      const coverName = coverFile.name;
      const coverLastDotIndex = coverName.lastIndexOf('.');
      this.coverInfo = {
        name: coverName.substring(0, coverLastDotIndex),
        type: coverName.substring(coverLastDotIndex + 1).toLowerCase(),
        size: coverFile.size
      };
      this.sessionName += `${coverFile.name}_${coverFile.size};`
    }
  };

  async applyUploadUGC(signature: string, retryCount: number = 0) {
    const self = this;

    let sendParam: IApplyUpload;
    const videoInfo = this.videoInfo;
    const coverInfo = this.coverInfo;
    const vodSessionKey = this.getStorage(this.sessionName);

    // resume from break point
    if (vodSessionKey) {
      sendParam = {
        'signature': signature,
        'vodSessionKey': vodSessionKey
      };
    } else if (videoInfo) {
      sendParam = {
        'signature': signature,
        'videoName': videoInfo.name,
        'videoType': videoInfo.type,
        'videoSize': videoInfo.size
      };
      if (coverInfo) { // upload video together with cover
        sendParam.coverName = coverInfo.name;
        sendParam.coverType = coverInfo.type;
        sendParam.coverSize = coverInfo.size;
      }
    } else if (this.fileId && coverInfo) { // alter cover
      sendParam = {
        'signature': signature,
        'fileId': this.fileId,
        'coverName': coverInfo.name,
        'coverType': coverInfo.type,
        'coverSize': coverInfo.size
      };
    } else {
      throw ('Wrong params, please check and try again');
    }

    async function whenError(err?: vodError): Promise<any> {
      self.delStorage(self.sessionName)
      if (self.applyRequestRetryCount == retryCount) {
        if (err) {
          throw err
        }
        throw new Error(`apply upload failed`)
      }
      await util.delay(self.retryDelay);
      return self.applyUploadUGC(signature, retryCount + 1);
    }

    let response;
    try {
      response = await axios.post('https://vod2.qcloud.com/v3/index.php?Action=ApplyUploadUGC', sendParam, {
        timeout: this.applyRequestTimeout,
        withCredentials: false,
      })
    } catch (e) {
      return whenError()
    }

    const applyResult = response.data;
    // all err code https://user-images.githubusercontent.com/1147375/51222454-bf6ef280-1978-11e9-8e33-1b0fdb2fe200.png
    if (applyResult.code == 0) {
      const vodSessionKey = applyResult.data.vodSessionKey;
      this.setStorage(this.sessionName, vodSessionKey);
      return applyResult.data;
    } else {
      // return the apply result error info
      const err: vodError = new Error(applyResult.message)
      err.code = applyResult.code;
      return whenError(err)
    }
  }

  async uploadToCos(applyData: IApplyData) {
    const self = this;

    const cosParam = {
      bucket: applyData.storageBucket + '-' + applyData.storageAppId,
      region: applyData.storageRegionV5,
    };

    const cos = new COS({
      getAuthorization: async function (options: object, callback: Function) {
        const signature = await self.getSignature();
        const applyData = await self.applyUploadUGC(signature);

        callback({
          TmpSecretId: applyData.tempCertificate.secretId,
          TmpSecretKey: applyData.tempCertificate.secretKey,
          XCosSecurityToken: applyData.tempCertificate.token,
          ExpiredTime: applyData.tempCertificate.expiredTime,
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
        onProgress: function (data: any) {
          self.emit(UploaderEvent.video_progress, data);
        },
        onUpload: function (data: any) {
          self.emit(UploaderEvent.video_upload, data);
        },
        TaskReady: function (taskId: string) {
          self.taskId = taskId
        }
      }
      uploadCosParams.push(cosVideoParam)
    }

    if (this.coverFile) {
      const cosCoverParam = {
        ...cosParam,
        file: this.coverFile,
        key: applyData.cover.storagePath,
        onProgress: function (data: any) {
          self.emit(UploaderEvent.cover_progress, data);
        },
        onUpload: function (data: any) {
          self.emit(UploaderEvent.cover_upload, data);
        },
        TaskReady: util.noop,
      }
      uploadCosParams.push(cosCoverParam)
    }

    const uploadPromises = uploadCosParams.map((uploadCosParam) => {
      return new Promise<void>(function (resolve, reject) {
        cos.sliceUploadFile({
          Bucket: uploadCosParam.bucket,
          Region: uploadCosParam.region,
          Key: uploadCosParam.key,
          Body: uploadCosParam.file,
          TaskReady: uploadCosParam.TaskReady,
          onProgress: uploadCosParam.onProgress,
        }, function (err: any, data: any) {
          if (!err) {
            uploadCosParam.onUpload(data);
            return resolve()
          }
          self.delStorage(self.sessionName)
          reject(err);
        });
      })
    })

    return await Promise.all(uploadPromises)
  }

  async commitUploadUGC(signature: string, vodSessionKey: string, retryCount: number = 0) {
    const self = this;

    this.delStorage(this.sessionName);

    async function whenError(): Promise<any> {
      if (self.commitRequestRetryCount == retryCount) {
        throw new Error('commit upload failed')
      }
      await util.delay(self.retryDelay);
      return self.commitUploadUGC(signature, vodSessionKey, retryCount + 1)
    }

    let response;
    try {
      response = await axios.post('https://vod2.qcloud.com/v3/index.php?Action=CommitUploadUGC', {
        'signature': signature,
        'vodSessionKey': vodSessionKey,
      }, {
          timeout: this.commitRequestTimeout,
          withCredentials: false,
        })
    } catch (e) {
      return whenError()
    }

    const commitResult = response.data;
    if (commitResult.code == 0) {
      return commitResult.data;
    } else {
      return whenError();
    }
  }

  start() {
    this.donePromise = this._start()
  }

  async _start() {
    const signature = await this.getSignature();
    const applyData = await this.applyUploadUGC(signature);
    await this.uploadToCos(applyData)

    const newSignature = await this.getSignature();
    return await this.commitUploadUGC(newSignature, applyData.vodSessionKey)
  }

  done() {
    return this.donePromise;
  }

  cancel() {
    this.cos.cancelTask(this.taskId);
  }
}

export default Uploader