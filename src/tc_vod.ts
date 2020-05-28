import Uploader, { IGetSignature, UploaderOptions } from "./uploader";
import { VodReporter } from "./vod_reporter";

interface TcVodParams {
  getSignature: IGetSignature;
  allowReport?: boolean;
  appId?: number;
  reportId?: string;
  enableResume?: boolean;
}
class TcVod {
  getSignature: IGetSignature;
  allowReport = true; // report sdk status to tencent cloud
  appId: number;
  reportId: string;
  enableResume = true; // resume uploading from break point
  constructor(params: TcVodParams) {
    this.getSignature = params.getSignature;
    if (params.allowReport !== void 0) {
      this.allowReport = params.allowReport;
    }
    if (params.enableResume !== void 0) {
      this.enableResume = params.enableResume;
    }
    this.appId = params.appId;
    this.reportId = params.reportId;
  }

  upload(params: Omit<UploaderOptions, "getSignature">): Uploader {
    const uploaderParams = {
      getSignature: this.getSignature,
      appId: this.appId,
      reportId: this.reportId,
      enableResume: this.enableResume,
      ...params
    };
    const uploader = new Uploader(uploaderParams);
    if (this.allowReport) {
      this.initReporter(uploader);
    }
    uploader.start();
    return uploader;
  }

  // report to official report system
  initReporter(uploader: Uploader): void {
    new VodReporter(uploader);
  }
}

export default TcVod;
