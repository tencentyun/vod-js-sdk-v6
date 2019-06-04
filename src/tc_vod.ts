import Uploader, { IGetSignature, UploaderOptions } from "./uploader";
import { VodReporter } from "./vod_reporter";

interface TcVodParams {
  getSignature: IGetSignature;
}
class TcVod {
  getSignature: IGetSignature;
  constructor(params: TcVodParams) {
    this.getSignature = params.getSignature;
  }

  upload(params: UploaderOptions): Uploader {
    params = { getSignature: this.getSignature, ...params };
    const uploader = new Uploader(params);
    this.initReporter(uploader);
    uploader.start();
    return uploader;
  }

  // report to official report system
  initReporter(uploader: Uploader): void {
    new VodReporter(uploader);
  }
}

export default TcVod;
