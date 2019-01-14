const sha1 = require('js-sha1')
const COS = require('cos-js-sdk-v5')

import * as is from 'is'
import axios from 'axios'
import util from './util'

export type IGetSignature = () => Promise<string>
export type TcVodFileInfo = { name: string, type: string, size: number }

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
  videoFile: File,

  cosSuccess?: Function,
  cosCoverSuccess?: Function,
  progress?: Function,
  coverProgress?: Function,
  hashProgress?: Function,
  coverHashProgress?: Function,
  allowAudio?: boolean,
  videoName?: string,
  coverFile?: File,
  isTempSignature?: boolean,
}

class Uploader implements IUploader {
  getSignature: IGetSignature;
  videoFile: File;
  videoInfo: TcVodFileInfo;
  coverFile: File;
  coverInfo: TcVodFileInfo;
  progress: Function;
  coverProgress: Function;
  hashProgress: Function;
  coverHashProgress: Function;
  cosSuccess: Function;
  cosCoverSuccess: Function;
  allowAudio: boolean = false;
  videoName: string;
  storageName: string;
  fileId: string;
  isTempSignature: boolean;

  donePromise: Promise<object>;

  applyRequestTimeout = 5000;
  applyRequestRetry = 3;

  commitRequestTimeout = 5000;
  commitRequestRetry = 3;

  // video types
  videoTypes = [
    'WMV', 'WM', 'ASF', 'ASX', // microsoft types
    'RM', 'RMVB', 'RA', 'RAM', // real types
    'MPG', 'MPEG', 'MPE', 'VOB', 'DAT', // mpeg types
    'MOV', '3GP', 'MP4', 'MP4V', 'M4V', 'MKV', 'AVI', 'FLV', 'F4V' // other types
  ];

  // audio types
  audioTypes = ['MP3', 'WMA', 'WAV', 'ASF', 'AU', 'SND', 'RAW', 'AFC', 'ACC'];

  // pic types
  imageTypes = [
    'JPG', 'JPEG', 'JPE',
    'PSD',
    'SVG', 'SVGZ',
    'TIFF', 'TIF',
    'BMP', 'GIF', 'PNG'
  ];

  constructor(params: IUploader) {
    this.validateInitParams(params);

    this.videoFile = params.videoFile;
    this.getSignature = params.getSignature;

    this.progress = params.progress || util.noop;
    this.coverProgress = params.coverProgress || util.noop;
    this.hashProgress = params.hashProgress || util.noop;
    this.coverHashProgress = params.coverHashProgress || util.noop;
    this.cosSuccess = params.cosSuccess || util.noop;
    this.cosCoverSuccess = params.cosCoverSuccess || util.noop;
    this.allowAudio = params.allowAudio;
    this.videoName = params.videoName;
    this.coverFile = params.coverFile;
    this.isTempSignature = params.isTempSignature;

    this.genFileInfo()
    this.validateUploadParams()
  }

  // set storage
  setStorage(name: string, value: string) {
    if (this.getStorageNum() > 5) {
      return;
    }
    var cname = 'webugc_' + sha1(name);
    try {
      localStorage.setItem(cname, value);
    } catch (e) { }
  }

  // get storage
  getStorage(name: string) {
    var cname = 'webugc_' + sha1(name);
    var result = null;
    try {
      result = localStorage.getItem(cname);
    } catch (e) { }

    return result;
  }

  // delete storage
  delStorage(name: string) {
    var cname = 'webugc_' + sha1(name);
    try {
      localStorage.removeItem(cname);
    } catch (e) { }
  }

  // get all `webugc` prefix key
  getStorageNum() {
    var num = 0;
    try {
      var reg = /^webugc_[0-9a-fA-F]{40}$/;
      for (var i = 0; i < localStorage.length; i++) {
        if (reg.test(localStorage.key(i))) {
          num++;
        }
      }
    } catch (e) { }
    return num;
  }

  // validate init params
  validateInitParams(params: IUploader) {
    if (!is.fn(params.getSignature)) {
      throw new Error('getSignature必须为函数');
    }
    if (!util.isFile(params.videoFile)) {
      throw new Error('videoFile必须为视频文件');
    }

    if (params.cosSuccess && !is.fn(params.cosSuccess)) {
      throw new Error('success必须为函数');
    }

    if (params.progress && !is.fn(params.progress)) {
      throw new Error('progress必须为函数');
    }
    if (params.hashProgress && !is.fn(params.hashProgress)) {
      throw new Error('hashProgress必须为函数');
    }

  }

  // validate when init done
  validateUploadParams() {
    let allowVideoTypes = this.videoTypes
    //视频格式过滤
    if (this.allowAudio) {
      allowVideoTypes = allowVideoTypes.concat(this.audioTypes);
    }
    if (allowVideoTypes.indexOf(this.videoInfo.type.toUpperCase()) == -1) {
      console.log("视频文件格式不正确，请参考 https://cloud.tencent.com/document/product/266/2834#.E9.9F.B3.E8.A7.86.E9.A2.91.E4.B8.8A.E4.BC.A0");
    }
  }

  genFileInfo() {
    //视频
    const videoFile = this.videoFile;
    if (videoFile) {
      const lastDotIndex = videoFile.name.lastIndexOf('.');
      let videoName = '';
      //有指定视频名称，则用该名称
      if (this.videoName) {
        if (!is.string(this.videoName)) {
          throw new Error('videoName只能是字符串类型');
        } else if (/[:*?<>\"\\/|]/g.test(this.videoName)) {
          throw new Error('文件名不得包含 \\ / : * ? " < > | 字符');
        } else {
          videoName = this.videoName;
        }
      } else { //不然，则用上传文件的name
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
    const coverFile = this.coverFile;
    if (coverFile) {
      const coverName = coverFile.name;
      const coverLastDotIndex = coverName.lastIndexOf('.');
      this.coverInfo = {
        name: coverName.substring(0, coverLastDotIndex),
        type: coverName.substring(coverLastDotIndex + 1).toLowerCase(),
        size: coverFile.size
      };
    }
  };

  async applyUploadUGC(videoInfo: TcVodFileInfo, signature: string) {
    const self = this;

    let sendParam: IApplyUpload;
    const coverInfo = this.coverInfo;

    if (videoInfo) {
      const vodSessionKey = this.getStorage(this.storageName);
      if (vodSessionKey) {
        sendParam = {
          'signature': signature,
          'vodSessionKey': vodSessionKey
        };
      } else {
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
    } else if (this.fileId && coverInfo) { //指定fileid和封面，则一起上传
      sendParam = {
        'signature': signature,
        'fileId': this.fileId,
        'coverName': coverInfo.name,
        'coverType': coverInfo.type,
        'coverSize': coverInfo.size
      };
    } else {
      throw ('参数存在问题，请检查后，再重试');
    }

    function whenError(): any {
      if (self.applyRequestRetry == 0) {
        throw new Error(`apply upload 失败`)
      }
      self.applyRequestRetry--;
      return self.applyUploadUGC(videoInfo, signature);
    }

    let response;
    try {
      response = await axios.post('https://vod2.qcloud.com/v3/index.php?Action=ApplyUploadUGC', sendParam, {
        timeout: this.applyRequestTimeout,
      })
    } catch (e) {
      return whenError()
    }

    const applyResult = response.data;
    if (applyResult.code == 0) {
      const vodSessionKey = applyResult.data.vodSessionKey;
      this.setStorage(this.storageName, vodSessionKey);
      return applyResult.data;
    } else {
      return whenError()
    }
  }

  async uploadToCos(applyData: IApplyData) {
    const self = this;

    const cosParam = {
      bucket: applyData.storageBucket + '-' + applyData.storageAppId,
      region: applyData.storageRegionV5,
      secretId: applyData.tempCertificate.secretId,
      secretKey: applyData.tempCertificate.secretKey,
      token: applyData.tempCertificate.token,
      expiredTime: applyData.tempCertificate.expiredTime
    };

    var cos = new COS({
      getAuthorization: function (options: object, callback: Function) {
        callback({
          TmpSecretId: cosParam.secretId,
          TmpSecretKey: cosParam.secretKey,
          XCosSecurityToken: cosParam.token,
          ExpiredTime: cosParam.expiredTime
        });
      }
    });

    const uploadCosParams = [];

    if (this.videoFile) {
      const cosVideoParam = {
        ...cosParam,
        file: this.videoFile,
        key: applyData.video.storagePath,
        onProgress: function (progressData: any) {
          self.progress(progressData)
        },
        onHashProgress: function (progressData: any) {
          self.hashProgress(progressData);
        },
        onSuccess: function (data: any) {
          self.cosSuccess(data)
        },
      }
      uploadCosParams.push(cosVideoParam)
    }

    if (this.coverFile) {
      const cosCoverParam = {
        ...cosParam,
        file: this.coverFile,
        key: applyData.cover.storagePath,
        onProgress: function (progressData: any) {
          self.coverProgress(progressData)
        },
        onHashProgress: function (progressData: any) {
          self.coverHashProgress(progressData);
        },
        onSuccess: function (data: any) {
          self.cosCoverSuccess(data)
        },
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
          onHashProgress: uploadCosParam.onHashProgress,
          onProgress: uploadCosParam.onProgress,
        }, function (err: any, data: any) {
          if (!err) {
            uploadCosParam.onSuccess(data);
            resolve()
          } else {
            reject(err);
          }
        });
      })
    })

    return await Promise.all(uploadPromises)
  }

  async commitUploadUGC(signature: string, vodSessionKey: string) {
    const self = this;

    this.delStorage(this.storageName);

    function whenError(): any {
      if (self.commitRequestRetry == 0) {
        throw new Error('commit upload 失败')
      }
      self.commitRequestRetry--;
      return self.commitUploadUGC(signature, vodSessionKey)
    }

    let response;
    try {
      response = await axios.post('https://vod2.qcloud.com/v3/index.php?Action=CommitUploadUGC', {
        'signature': signature,
        'vodSessionKey': vodSessionKey
      }, {
          timeout: this.commitRequestTimeout,
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
    const applyData = await this.applyUploadUGC(this.videoInfo, signature);
    await this.uploadToCos(applyData)

    let newSignature = signature
    if (this.isTempSignature) {
      // 每次finish的时候都重新获取一遍，防止密钥失效
      newSignature = await this.getSignature();
    }
    return await this.commitUploadUGC(newSignature, applyData.vodSessionKey)
  }

  done() {
    return this.donePromise;
  }

  cancel() {

  }
}

export default Uploader