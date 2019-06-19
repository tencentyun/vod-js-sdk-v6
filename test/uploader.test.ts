import * as assert from "assert";
import Uploader, { UploaderEvent } from "../src/uploader";
import util from "../src/util";
import * as mm from "mm";
import axios from "axios";
const COS = require("cos-js-sdk-v5");

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
describe("uploader.test.ts", () => {
  afterEach(function() {
    mm.restore();
  });
  describe("#new", function() {
    it("should accept getSignature and mediaFile", () => {
      const uploader = new Uploader({
        getSignature: fakeGetSignature,
        mediaFile: fakeMediaFile
      });
    });

    it("should fail when init params wrong", () => {
      // without signature
      assert.throws(() => {
        const uploader = new Uploader({
          getSignature: null
        });
      }, /getSignature must be a function/);
    });
  });

  describe("#genFileInfo", () => {
    it("should gen file info", () => {
      const uploader = new Uploader({
        getSignature: fakeGetSignature,
        mediaFile: fakeMediaFile
      });
      assert(uploader.videoInfo.name == "vv.dd");
      assert(uploader.videoInfo.type == "mp4");
      assert(uploader.videoInfo.size == 100);
    });

    it("should use `mediaName` param", () => {
      const uploader = new Uploader({
        getSignature: fakeGetSignature,
        mediaFile: fakeMediaFile,
        mediaName: "custom_video_name"
      });
      assert(uploader.videoName == "custom_video_name");
    });

    it("should throw when invalid `mediaName`", () => {
      assert.throws(() => {
        const uploader = new Uploader({
          getSignature: fakeGetSignature,
          mediaFile: fakeMediaFile,
          mediaName: 11 as any
        });
      }, /mediaName must be a string/);

      assert.throws(() => {
        const uploader = new Uploader({
          getSignature: fakeGetSignature,
          mediaFile: fakeMediaFile,
          mediaName: "*"
        });
      }, /Cant use these chars in filename/);
    });
  });

  describe("#start", () => {
    it("should start", async function() {
      // 各函数需要被调用的次数
      const shouldCalled: any = {
        getSignature: 2,
        applyUploadUGC: 1,
        cosSuccess: 1,
        cosCoverSuccess: 1
      };

      const uploader = new Uploader({
        getSignature: () => {
          shouldCalled.getSignature--;
          return fakeGetSignature();
        },
        mediaFile: fakeMediaFile,
        coverFile: fakeMediaFile
      });
      uploader.on(UploaderEvent.video_upload, () => {
        shouldCalled.cosSuccess--;
      });
      uploader.on(UploaderEvent.cover_upload, () => {
        shouldCalled.cosCoverSuccess--;
      });

      // 拦截 applyUploadUGC 中的post请求
      const old_applyUploadUGC = uploader.applyUploadUGC;
      mm(uploader, "applyUploadUGC", function() {
        shouldCalled.applyUploadUGC--;
        mm(axios, "post", () => {
          return {
            data: {
              code: 0,
              message: "成功",
              data: {
                video: {
                  storageSignature:
                    "bWcRMHMhwcaYQykMVNx0izvERAdhPTEwMDIyODUzJmI9ZmFlZWQ0NTZ2b2RjcTE0MDAxNzAwMzQmaz1BS0lESVdlN0F0STEwUFFrbThSRURsNFVPN0k2bXluNk5ERjcmZT0xNTQ3ODkyMTc1JnQ9MTU0NzcxOTM3NSZyPTI2NzAxNTYxODAmZj0vMTAwMjI4NTMvZmFlZWQ0NTZ2b2RjcTE0MDAxNzAwMzQvZmFlZWQ0NTZ2b2RjcTE0MDAxNzAwMzQvN2Y1MWQ5NmI1Mjg1ODkwNzg0NDE4NjA1MTIzL3gyZVdGWFBmdE1FQS5tcDQ=",
                  storagePath:
                    "/faeed456vodcq1400170034/7f51d96b5285890784418605123/x2eWFXPftMEA.mp4"
                },
                cover: {
                  storageSignature:
                    "VgnnV+kwG8p7LvME+Thc2aaiIO5hPTEwMDIyODUzJmI9ZmFlZWQ0NTZ2b2RjcTE0MDAxNzAwMzQmaz1BS0lESVdlN0F0STEwUFFrbThSRURsNFVPN0k2bXluNk5ERjcmZT0xNTQ3ODkyMTc1JnQ9MTU0NzcxOTM3NSZyPTE0NzAzNDkzNjkmZj0vMTAwMjI4NTMvZmFlZWQ0NTZ2b2RjcTE0MDAxNzAwMzQvZmFlZWQ0NTZ2b2RjcTE0MDAxNzAwMzQvN2Y1MWQ5NmI1Mjg1ODkwNzg0NDE4NjA1MTIzLzUyODU4OTA3ODQ0MTg2MDUxMjQucG5n",
                  storagePath:
                    "/faeed456vodcq1400170034/7f51d96b5285890784418605123/5285890784418605124.png"
                },
                storageAppId: 10022853,
                storageBucket: "faeed456vodcq1400170034",
                storageRegion: "cq",
                storageRegionV5: "ap-chongqing",
                domain: "vod2.qcloud.com",
                vodSessionKey:
                  "3FEmq9DWHl1xF819mM6j0fyDQDSON8VtwN/RTrl/9m49AEEWV9jV5txk3AckBj1lkl3EkTMVx1ah/wOuKPElzHG4gHwRVPpge+UZ7sdmqvmQJ9bhLhiAZDTDDMVlSW6j2a4bIIUDI7erahcpKs/oh0koMLcoErCFBr+nHhFKT2qfIyc8b+izX5GBFIkXuLzDGMjTnYuQAomqeHYanuP5dns0+7CGkK26M4d9n0VU7DEQ4GEweORsIQCqsQT6+0DLnZ9qFO4mBeVOb6Ro5qGIi3uhq2AFmMQmrMXZfdSvcdnoLYPmDxvM8inrhri0CHBIq6UyJqsKmsYU0ufHkc2S3feaVRHxM9ahqRK2iNXtOche9wH2dFJ+eX7OQ/Vek75rKlpCUE68peHv9KeNf5/7y9buUXeguBYC74pU+oJ2ffu/INgkFkP9tdw4EgkkRyqsQPIWbuFrXXy5fyPzCoMgDnH0QgzUsHGgKTkk4UjvLdXZR21soD6pxcdXj1n/VHyljouY8uMz5nvg3KTAL9ze73+MJvuD4LUIMahagY5MhiHbMCGHXOVG6BDq6WQr9PjkOxH3PteeekyWvxdaxc/icVvQO+2ytIX2/P/V91eBs9qmxpYvD2Mnf1HkeANPCRBIpvLhBRHRGPKN9tVg1CFcBRr6Ruxr5rs2E0eDPhy6s/5RwRcf2CcfnOTKC+jamY/qhgc1Kl3sLh7JkhM3Onwxi+i5OIdaOvdS2NYst6Xn0tQFDT+vOK3n45k4HTYK6LdaJZAqjmtBHNBeohp/JM/7ZiAcNoCsR4FPaTH9Y1GAGYZHC0nw/E932tYrg26QsyFeAOWhW6xkdk+TwMtV92bQu8DmvxojyQZlDJgWjJPa+1B9B9C7OtbYeUZ5+SBC+Z23YYplFkKyBEWC4j+x52R+g463In9DFsZdRb2NCmBGBC8CARgQypTZ4Q==",
                tempCertificate: {
                  secretId: "AKIDQdDpJ2prWTKv2DD3iVTREIJ6BcX7fKOv",
                  secretKey: "7U7lo8efZvxFmHxX93U06qt9iNbW0ya0",
                  token: "0b7d1d00e82fda8027624c95563c34a3107e224b30001",
                  expiredTime: 1547726575
                },
                appId: 1400170034,
                timestamp: 1547719375,
                StorageRegionV5: "ap-chongqing"
              }
            }
          };
        });
        return old_applyUploadUGC.apply(uploader, arguments);
      });

      // 拦截 uploadToCos 中的上传请求
      const old_uploadToCos = uploader.uploadToCos;
      mm(uploader, "uploadToCos", function() {
        mm(COS.prototype, "sliceUploadFile", function(
          sliceParams: any,
          callback: Function
        ) {
          // {
          //   Bucket: uploadCosParam.bucket,
          //   Region: uploadCosParam.region,
          //   Key: uploadCosParam.key,
          //   Body: uploadCosParam.file,
          //   onTaskReady: uploadCosParam.onTaskReady,
          //   onProgress: uploadCosParam.onProgress,
          // }
          assert(util.isString(sliceParams.Bucket));
          assert(util.isString(sliceParams.Region));
          assert(util.isString(sliceParams.Key));
          assert(util.isFile(sliceParams.Body));
          assert(util.isFunction(sliceParams.onTaskReady));
          assert(util.isFunction(sliceParams.onProgress));
          callback();
        });
        return old_uploadToCos.apply(uploader, arguments);
      });

      // 拦截 commitUploadUGC 中的post请求
      const old_commitUploadUGC = uploader.commitUploadUGC;
      mm(uploader, "commitUploadUGC", function() {
        mm(axios, "post", () => {
          return {
            data: {
              code: 0,
              message: "成功",
              data: {
                video: {
                  url:
                    "http://1400170034.vod2.myqcloud.com/faeed456vodcq1400170034/7f51d96b5285890784418605123/x2eWFXPftMEA.mp4",
                  verify_content:
                    "EmqHd4LLop2dL692wAoVl5FshQVFeHBUaW1lPTE1NDc3MjI5ODYmRmlsZUlkPTUyODU4OTA3ODQ0MTg2MDUxMjM="
                },
                cover: {
                  url:
                    "http://1400170034.vod2.myqcloud.com/faeed456vodcq1400170034/7f51d96b5285890784418605123/5285890784418605124.png",
                  verify_content:
                    "WIqkMGzIaOl8try34aPB+JklA4xFeHBUaW1lPTE1NDc3MjI5ODYmRmlsZUlkPTUyODU4OTA3ODQ0MTg2MDUxMjQ="
                },
                fileId: "5285890784418605123"
              }
            }
          };
        });
        return old_commitUploadUGC.call(uploader, arguments);
      });

      uploader.start();
      const doneResult = await uploader.done();

      // 开始校验各部分的工作情况
      assert(util.isString(doneResult.video.url));

      for (const key in shouldCalled) {
        assert(shouldCalled[key] == 0);
      }
    });
  });

  describe("#applyUploadUGC", () => {
    it("should retry", async () => {
      const uploader = new Uploader({
        getSignature: fakeGetSignature,
        mediaFile: fakeMediaFile
      });
      uploader.retryDelay = 100; // dont wait too long

      let applyUploadUGCCalled = 0;

      mm(axios, "post", () => {
        applyUploadUGCCalled++;
        throw new Error("fake post error");
      });
      await assert.rejects(async () => {
        await uploader.applyUploadUGC();
      }, /fake post error/);
      assert(applyUploadUGCCalled == 4);
    });
  });
});
