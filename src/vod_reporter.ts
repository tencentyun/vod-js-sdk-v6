import Uploader from "./uploader";
import * as pkg from "../package.json";
import axios from "axios";
import util from "./util";

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

interface ReportObj {
  err: any;
  requestStartTime: Date;
  data: any;
}

export class VodReporter {
  uploader: Uploader;
  options: IVodReporter;

  // only partial data when created
  baseReportData: any = {
    version: pkg.version,
    platform: 3000,
    device: navigator.userAgent
  };

  reportUrl = "https://vodreport.qcloud.com/ugcupload_new";

  constructor(uploader: Uploader, options?: IVodReporter) {
    this.uploader = uploader;
    this.options = options;

    this.init();
  }

  init() {
    this.uploader.on(VodReportEvent.report_apply, this.onApply.bind(this));
    this.uploader.on(
      VodReportEvent.report_cos_upload,
      this.onCosUpload.bind(this)
    );
    this.uploader.on(VodReportEvent.report_commit, this.onCommit.bind(this));
  }

  // ApplyUploadUGC
  onApply(reportObj: ReportObj) {
    try {
      const uploader = this.uploader;
      if (!uploader.videoFile) {
        return;
      }
      Object.assign(this.baseReportData, {
        appId: uploader.appId,
        fileSize: uploader.videoFile.size,
        fileName: uploader.videoFile.name,
        fileType: uploader.videoFile.type,
        vodSessionKey: uploader.vodSessionKey
      });

      const customReportData = {
        reqType: ReqType.apply,
        vodErrCode: 0,
        errMsg: "",
        reqTimeCost: Number(new Date()) - Number(reportObj.requestStartTime),
        reqTime: Number(reportObj.requestStartTime)
      };
      if (reportObj.err) {
        customReportData.vodErrCode = reportObj.err.code;
        customReportData.errMsg = reportObj.err.message;
      }
      if (reportObj.data) {
        this.baseReportData.cosRegion = reportObj.data.storageRegionV5;
      }
      this.report(customReportData);
    } catch (e) {
      console.error(`onApply`, e);
      if (util.isTest) {
        throw e;
      }
    }
  }

  // upload to cos
  onCosUpload(reportObj: ReportObj) {
    try {
      const customReportData = {
        reqType: ReqType.cos_upload,
        cosErrCode: "",
        errMsg: "",
        reqTimeCost: Number(new Date()) - Number(reportObj.requestStartTime),
        reqTime: Number(reportObj.requestStartTime)
      };
      if (reportObj.err) {
        customReportData.cosErrCode = reportObj.err.error.Code;
        customReportData.errMsg = JSON.stringify(reportObj.err);
      }
      this.report(customReportData);
    } catch (e) {
      console.error(`onCosUpload`, e);
      if (util.isTest) {
        throw e;
      }
    }
  }

  // CommitUploadUGC
  onCommit(reportObj: ReportObj) {
    try {
      const customReportData = {
        reqType: ReqType.commit,
        vodErrCode: 0,
        errMsg: "",
        reqTimeCost: Number(new Date()) - Number(reportObj.requestStartTime),
        reqTime: Number(reportObj.requestStartTime)
      };
      if (reportObj.err) {
        customReportData.vodErrCode = reportObj.err.code;
        customReportData.errMsg = reportObj.err.message;
      }
      if (reportObj.data) {
        this.baseReportData.fileId = reportObj.data.fileId;
      }
      this.report(customReportData);
    } catch (e) {
      console.error(`onCommit`, e);
      if (util.isTest) {
        throw e;
      }
    }
  }

  report(reportData: any) {
    reportData = { ...this.baseReportData, ...reportData };
    this.send(reportData);
  }

  send(reportData: any) {
    axios.post(this.reportUrl, reportData);
  }
}
