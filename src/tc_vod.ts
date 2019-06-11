import Uploader, { IGetSignature, UploaderOptions } from "./uploader";
import { VodReporter } from "./vod_reporter";

interface TcVodParams {
  getSignature: IGetSignature;
  allowReport?: boolean;
}
class TcVod {
  getSignature: IGetSignature;
  allowReport = true; // report sdk status to tencent cloud
  constructor(params: TcVodParams) {
    this.getSignature = params.getSignature;
    if (params.allowReport !== void 0) {
      this.allowReport = params.allowReport;
    }
  }

  upload(params: UploaderOptions): Uploader {
    params = { getSignature: this.getSignature, ...params };
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
