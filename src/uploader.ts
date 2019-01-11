import is = require('is')
import sha1 = require('sha1')

function isFile(v: any) {
  return Object.prototype.toString.call(v) == "[object File]"
}

export type IGetSignature = (callback: (signature: string) => void) => void

export interface IUploader {
  getSignature: IGetSignature;
  videoFile: File,

  cosSuccess?: Function,
  progress?: Function,
  hashProgress?: Function,
  allowAudio?: boolean,
}

class Uploader implements IUploader {
  getSignature: IGetSignature;
  videoFile: File;
  videoInfo: {name: string, type: string, size: number};
  progress: Function = () => {};
  hashProgress: Function = () => {};
  cosSuccess: Function = () => {}
  allowAudio: boolean = false;

  constructor(params: IUploader) {
    this.validateInitParams(params);

    this.videoFile = params.videoFile;
    this.getSignature = params.getSignature;

    this.progress = params.progress;
    this.hashProgress = params.hashProgress;
    this.cosSuccess = params.cosSuccess;
    this.allowAudio = params.allowAudio;

    this.validateUploadParams()
  }

  // video types
  videoTypes = [
    'WMV', 'WM', 'ASF', 'ASX', // microsoft types
    'RM', 'RMVB', 'RA', 'RAM', // real types
    'MPG', 'MPEG', 'MPE', 'VOB', 'DAT', // mpeg types
    'MOV', '3GP', 'MP4', 'MP4V', 'M4V', 'MKV', 'AVI', 'FLV', 'F4V' // other types
  ];

  // audio types
  audioTypes = ['MP3','WMA','WAV','ASF','AU','SND','RAW','AFC','ACC'];

  // pic types
  imageTypes = [
    'JPG', 'JPEG', 'JPE',
    'PSD',
    'SVG', 'SVGZ',
    'TIFF', 'TIF',
    'BMP', 'GIF', 'PNG'
  ];

  // set storage
  setStorage(name: string, value: string) {
    if (this.getStorageNum() > 5) {
      return;
    }
    var cname = 'webugc_' + sha1(name);
    try {
      localStorage.setItem(cname, value);
    } catch (e) {}
  }

  // get storage
  getStorage(name: string) {
    var cname = 'webugc_' + sha1(name);
    var result = null;
    try {
      result = localStorage.getItem(cname);
    } catch (e) {}

    return result;
  }

  // delete storage
  delStorage(name: string) {
    var cname = 'webugc_' + sha1(name);
    try {
      localStorage.removeItem(cname);
    } catch (e) {}
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
    } catch (e) {}
    return num;
  }

  // validate init params
  validateInitParams(params: IUploader) {
    if (!is.fn(params.getSignature)) {
      throw 'getSignature必须为函数';
    }

    if (!is.fn(params.cosSuccess)) {
      throw 'success必须为函数';
    }

    if (params.progress && !is.fn(params.progress)) {
      throw 'progress必须为函数';
    }
    if (params.hashProgress && !is.fn(params.hashProgress)) {
      throw 'hashProgress必须为函数';
    }
    if (!isFile(params.videoFile)) {
      throw 'videoFile必须为视频文件';
    }
  }

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

  done() {

  }
}

export default Uploader