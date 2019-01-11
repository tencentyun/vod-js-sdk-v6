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
  videoName?: string,
  coverFile?: File,
}

class Uploader implements IUploader {
  getSignature: IGetSignature;
  videoFile: File;
  videoInfo: {name: string, type: string, size: number};
  coverFile: File;
  coverInfo: {name: string, type: string, size: number};
  progress: Function = () => {};
  hashProgress: Function = () => {};
  cosSuccess: Function = () => {}
  allowAudio: boolean = false;
  videoName: string;
  storageName: string;

  constructor(params: IUploader) {
    this.validateInitParams(params);

    this.videoFile = params.videoFile;
    this.getSignature = params.getSignature;

    this.progress = params.progress;
    this.hashProgress = params.hashProgress;
    this.cosSuccess = params.cosSuccess;
    this.allowAudio = params.allowAudio;
    this.videoName = params.videoName;
    this.coverFile = params.coverFile;

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
    if (!isFile(params.videoFile)) {
      throw 'videoFile必须为视频文件';
    }

    if (params.cosSuccess && !is.fn(params.cosSuccess)) {
      throw 'success必须为函数';
    }

    if (params.progress && !is.fn(params.progress)) {
      throw 'progress必须为函数';
    }
    if (params.hashProgress && !is.fn(params.hashProgress)) {
      throw 'hashProgress必须为函数';
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
          throw 'videoName只能是字符串类型';
        } else if (/[:*?<>\"\\/|]/g.test(this.videoName)) {
          throw '文件名不得包含 \\ / : * ? " < > | 字符';
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

  done() {

  }
}

export default Uploader