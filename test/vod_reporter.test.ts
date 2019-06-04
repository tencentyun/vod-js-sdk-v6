import * as assert from "assert";
import { VodReporter, VodReportEvent } from "../src/vod_reporter";
import { EventEmitter } from "events";
import Uploader from "../src/uploader";

function genUploader() {
  return new EventEmitter() as Uploader;
}

describe("uploader.test.ts", () => {
  it("should report apply", () => {
    const uploader = genUploader();

    const vodReporter = new VodReporter(uploader);
    vodReporter.report = reportData => {
      console.log(reportData);
    };

    uploader.emit(VodReportEvent.report_apply, {
      name: "alsotang"
    });
  });
});
