import Uploader, { IGetSignature, UploaderOptions } from "./uploader";
import { VodReporter } from "./vod_reporter";

interface TcVodParams {
  getSignature: IGetSignature;
  allowReport?: boolean;
  appId?: number;
  reportId?: string;
}
class TcVod {
  getSignature: IGetSignature;
  allowReport = true; // report sdk status to tencent cloud
  appId: number;
  reportId: string;
  constructor(params: TcVodParams) {
    this.getSignature = params.getSignature;
    if (params.allowReport !== void 0) {
      this.allowReport = params.allowReport;
    }
    this.appId = params.appId;
    this.reportId = params.reportId;
  }

  upload(params: Omit<UploaderOptions, "getSignature">): Uploader {
    const uploaderParams = {
      getSignature: this.getSignature,
      appId: this.appId,
      reportId: this.reportId,
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
