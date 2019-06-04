import * as assert from "assert";
import TcVod from "../src/tc_vod";
import Uploader from "../src/uploader";
import * as mm from "mm";

describe("tc_vod.test.ts", () => {
  afterEach(function() {
    mm.restore();
  });

  describe("#upload", () => {
    it("should return a Promise", async () => {
      const tcVod = new TcVod({
        getSignature: (() => {}) as any
      });
      mm(Uploader.prototype, "_start", () => {
        return Promise.resolve(1);
      });
      const uploader = tcVod.upload({} as any);
      const doneResult = await uploader.done();
      assert(doneResult === 1);
    });
  });
});
