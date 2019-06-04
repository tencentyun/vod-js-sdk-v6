import Uploader from "./uploader";
import * as pkg from "../package.json";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IVodReporter {}

export enum VodReportEvent {
  report_apply = "report_apply",
  report_cos_upload = "report_cos_upload",
  report_commit = "report_commit"
}

enum ReqType {
  apply = 10001,
  cos_upload = 20001,
  commit = 10002
}

export class VodReporter {
  uploader: Uploader;
  options: IVodReporter;

  baseReportData = {
    version: pkg.version,
    platform: 3000
  };

  constructor(uploader: Uploader, options?: IVodReporter) {
    this.uploader = uploader;
    this.options = options;

    this.init();
  }

  init() {
    this.uploader.on(VodReportEvent.report_apply, this.onApply);
    this.uploader.on(VodReportEvent.report_cos_upload, this.onCosUpload);
    this.uploader.on(VodReportEvent.report_commit, this.onCommit);
  }

  onApply(reportData: any) {
    const newReportData = {
      reqType: ReqType.apply
    };
    this.report(newReportData);
  }
  onCosUpload(reportData: any) {
    const newReportData = {
      reqType: ReqType.cos_upload
    };
    this.report(newReportData);
  }
  onCommit(reportData: any) {
    const newReportData = {
      reqType: ReqType.commit
    };
    this.report(newReportData);
  }

  report(reportData: any) {
    reportData = { ...this.baseReportData, ...reportData };
    console.log(reportData);
  }
}
