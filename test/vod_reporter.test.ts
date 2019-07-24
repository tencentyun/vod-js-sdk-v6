import * as assert from "assert";
import { VodReporter, VodReportEvent } from "../src/vod_reporter";
import { EventEmitter } from "events";
import Uploader from "../src/uploader";
import * as semver from "semver";

function genUploader() {
  const fakeGetSignature = async () => {
    return "fakeGetSignature";
  };
  const fakeMediaFile: File = ({
    lastModified: null,
    name: "vv.dd.mp4",
    size: 100,
    type: "video/mp4",
    slice: null,
    toString() {
      return "[object File]";
    }
  } as any) as File;
  const uploader = new Uploader({
    getSignature: fakeGetSignature,
    mediaFile: fakeMediaFile,
    reportId: "12345"
  });
  return uploader;
}

function checkAndDelCommonProperty(reportData: any, requestStartTime: Date) {
  assert.strictEqual(reportData.reqTime, Number(requestStartTime));
  delete reportData.reqTime;
  assert.ok(reportData.reqTimeCost < 600);
  delete reportData.reqTimeCost;
  assert.ok(semver.valid(reportData.version));
  delete reportData.version;

  assert.ok(/\w+-\w+-\w+-\w+-\w+/.test(reportData.reqKey));
  delete reportData.reqKey;
}

describe("vod_reporter.test.ts", () => {
  const uploader = genUploader();
  const vodReporter = new VodReporter(uploader);
  describe("apply", () => {
    it("should report apply", () => {
      const requestStartTime = new Date(Number(new Date()) - 500);

      vodReporter.send = reportData => {
        checkAndDelCommonProperty(reportData, requestStartTime);

        assert.deepStrictEqual(reportData, {
          platform: 3000,
          reportId: "12345",
          device:
            "Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/13.2.0",
          errCode: 0,
          appId: 0,
          fileSize: 100,
          fileName: "vv.dd.mp4",
          fileType: "video/mp4",
          vodSessionKey: "",
          cosRegion: "ap-chongqing",
          reqType: 10001,
          vodErrCode: 0,
          errMsg: ""
        });
      };
      uploader.emit(VodReportEvent.report_apply, {
        data: {
          storageRegionV5: "ap-chongqing"
        },
        requestStartTime: requestStartTime
      });
    });

    it("should report apply error", () => {
      const uploader = genUploader();
      const vodReporter = new VodReporter(uploader);
      const requestStartTime = new Date(Number(new Date()) - 500);

      vodReporter.send = reportData => {
        checkAndDelCommonProperty(reportData, requestStartTime);

        assert.deepStrictEqual(reportData, {
          platform: 3000,
          reportId: "12345",
          device:
            "Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/13.2.0",
          errCode: 1,
          appId: 0,
          fileSize: 100,
          fileName: "vv.dd.mp4",
          fileType: "video/mp4",
          vodSessionKey: "",
          reqType: 10001,
          vodErrCode: 10004,
          errMsg: "ugc upload | invalid signature"
        });
      };
      uploader.emit(VodReportEvent.report_apply, {
        err: { code: 10004, message: "ugc upload | invalid signature" },
        requestStartTime: requestStartTime
      });
    });
  });

  describe("cos upload", () => {
    it("should report cos upload", () => {
      const requestStartTime = new Date(Number(new Date()) - 500);

      vodReporter.send = reportData => {
        checkAndDelCommonProperty(reportData, requestStartTime);

        assert.deepStrictEqual(reportData, {
          platform: 3000,
          reportId: "12345",
          device:
            "Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/13.2.0",
          errCode: 0,
          appId: 0,
          fileSize: 100,
          fileName: "vv.dd.mp4",
          fileType: "video/mp4",
          vodSessionKey: "",
          cosRegion: "ap-chongqing",
          reqType: 20001,
          cosErrCode: "",
          errMsg: ""
        });
      };
      uploader.emit(VodReportEvent.report_cos_upload, {
        err: null,
        requestStartTime: requestStartTime
      });
    });
  });

  describe("commit", () => {
    it("should report commit", () => {
      const requestStartTime = new Date(Number(new Date()) - 500);

      vodReporter.send = reportData => {
        checkAndDelCommonProperty(reportData, requestStartTime);

        assert.deepStrictEqual(reportData, {
          platform: 3000,
          reportId: "12345",
          device:
            "Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/13.2.0",
          errCode: 0,
          appId: 0,
          fileSize: 100,
          fileName: "vv.dd.mp4",
          fileType: "video/mp4",
          vodSessionKey: "",
          cosRegion: "ap-chongqing",
          reqType: 10002,
          vodErrCode: 0,
          errMsg: "",
          fileId: "20190606"
        });
      };
      uploader.emit(VodReportEvent.report_commit, {
        data: {
          fileId: "20190606"
        },
        requestStartTime: requestStartTime
      });
    });

    it("should report commit error", () => {
      const requestStartTime = new Date(Number(new Date()) - 500);

      vodReporter.send = reportData => {
        checkAndDelCommonProperty(reportData, requestStartTime);

        assert.deepStrictEqual(reportData, {
          platform: 3000,
          reportId: "12345",
          device:
            "Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/13.2.0",
          errCode: 1,
          appId: 0,
          fileSize: 100,
          fileName: "vv.dd.mp4",
          fileType: "video/mp4",
          vodSessionKey: "",
          reqType: 10002,
          vodErrCode: 10004,
          errMsg: "ugc upload | invalid signature",
          fileId: "20190606",
          cosRegion: "ap-chongqing"
        });
      };
      uploader.emit(VodReportEvent.report_commit, {
        err: { code: 10004, message: "ugc upload | invalid signature" },
        requestStartTime: requestStartTime
      });
    });
  });
});
