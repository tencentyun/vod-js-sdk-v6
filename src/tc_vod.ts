import Uploader, { IGetSignature, UploaderOptions } from "./uploader";
import { VodReporter } from "./vod_reporter";

interface TcVodParams {
  getSignature: IGetSignature;
  allowReport?: boolean;
  appId?: number;
}
class TcVod {
  getSignature: IGetSignature;
  allowReport = true; // report sdk status to tencent cloud
  appId = 0;
  constructor(params: TcVodParams) {
    this.getSignature = params.getSignature;
    if (params.allowReport !== void 0) {
      this.allowReport = params.allowReport;
    }
    this.appId = params.appId;
  }

  upload(params: UploaderOptions): Uploader {
    params = { getSignature: this.getSignature, appId: this.appId, ...params };
    const uploader = new Uploader(params);
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
