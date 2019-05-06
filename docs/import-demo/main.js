import Vue from "vue/dist/vue.js";
import axios from "axios";
import TcVod from "vod-js-sdk-v6";

/**
 * 计算签名。
 **/
function getSignature() {
  return axios
    .post(
      "https://demo.vod2.myqcloud.com/ugc-upload/",
      JSON.stringify({
        Action: "GetUgcUploadSign"
      })
    )
    .then(function(response) {
      return response.data.data.sign;
    });
}

/*
      防盗链地址获取。这是腾讯云官网demo的特殊逻辑，用户可忽略此处。
    */
function getAntiLeechUrl(videoUrl, callback) {
  return axios
    .post(
      "https://demo.vod2.myqcloud.com/ugc-upload/",
      JSON.stringify({
        Action: "GetAntiLeechUrl",
        Url: videoUrl
      })
    )
    .then(function(response) {
      return response.data.data.url;
    });
}

var app = new Vue({
  el: "#main-area",
  data: {
    uploaderInfos: [],

    vcExampleVideoName: "",
    vcExampleCoverName: "",

    cExampleFileId: ""
  },
  created: function() {
    this.tcVod = new TcVod({
      getSignature: getSignature
    });
  },
  methods: {
    /**
     * vExample示例。添加视频
     **/
    vExampleAdd: function() {
      this.$refs.vExampleFile.click();
    },
    /**
     * vExample示例。上传视频过程。
     **/
    vExampleUpload: function() {
      var self = this;
      var mediaFile = this.$refs.vExampleFile.files[0];

      var uploader = this.tcVod.upload({
        mediaFile: mediaFile
      });
      uploader.on("media_progress", function(info) {
        uploaderInfo.progress = info.percent;
      });
      uploader.on("media_upload", function(info) {
        uploaderInfo.isVideoUploadSuccess = true;
      });

      console.log(uploader, "uploader");

      var uploaderInfo = {
        videoInfo: uploader.videoInfo,
        isVideoUploadSuccess: false,
        isVideoUploadCancel: false,
        progress: 0,
        fileId: "",
        videoUrl: "",
        cancel: function() {
          uploaderInfo.isVideoUploadCancel = true;
          uploader.cancel();
        }
      };

      this.uploaderInfos.push(uploaderInfo);

      uploader
        .done()
        .then(function(doneResult) {
          console.log("doneResult", doneResult);

          uploaderInfo.fileId = doneResult.fileId;

          return getAntiLeechUrl(doneResult.video.url);
        })
        .then(function(videoUrl) {
          uploaderInfo.videoUrl = videoUrl;
          self.$refs.vExample.reset();
        });
    },

    setVcExampleVideoName: function() {
      this.vcExampleVideoName = this.$refs.vcExampleVideo.files[0].name;
    },
    setVcExampleCoverName: function() {
      this.vcExampleCoverName = this.$refs.vcExampleCover.files[0].name;
    },
    /*
          vcExample添加视频
        */
    vcExampleAddVideo: function() {
      this.$refs.vcExampleVideo.click();
    },
    /*
          vcExample添加封面
        */
    vcExampleAddCover: function() {
      this.$refs.vcExampleCover.click();
    },
    /*
          vcExample上传过程
        */
    vcExampleAddUpload: function() {
      var self = this;

      var mediaFile = this.$refs.vcExampleVideo.files[0];
      var coverFile = this.$refs.vcExampleCover.files[0];

      var uploader = this.tcVod.upload({
        mediaFile: mediaFile,
        coverFile: coverFile
      });
      uploader.on("media_progress", function(info) {
        uploaderInfo.progress = info.percent;
      });
      uploader.on("media_upload", function(info) {
        uploaderInfo.isVideoUploadSuccess = true;
      });
      uploader.on("cover_progress", function(info) {
        uploaderInfo.coverProgress = info.percent;
      });
      uploader.on("cover_upload", function(info) {
        uploaderInfo.isCoverUploadSuccess = true;
      });
      console.log(uploader, "uploader");

      var uploaderInfo = {
        videoInfo: uploader.videoInfo,
        coverInfo: uploader.coverInfo,
        isVideoUploadSuccess: false,
        isVideoUploadCancel: false,
        isCoverUploadSuccess: false,
        progress: 0,
        coverProgress: 0,
        fileId: "",
        videoUrl: "",
        coverUrl: "",
        cancel: function() {
          uploaderInfo.isVideoUploadCancel = true;
          uploader.cancel();
        }
      };

      this.uploaderInfos.push(uploaderInfo);

      uploader
        .done()
        .then(function(doneResult) {
          console.log("doneResult", doneResult);

          uploaderInfo.fileId = doneResult.fileId;

          uploaderInfo.coverUrl = doneResult.cover.url;
          return getAntiLeechUrl(doneResult.video.url);
        })
        .then(function(videoUrl) {
          uploaderInfo.videoUrl = videoUrl;
          self.$refs.vcExample.reset();
          self.vcExampleVideoName = "";
          self.vcExampleCoverName = "";
        });
    },

    // cExample 添加封面
    cExampleAddCover: function() {
      this.$refs.cExampleCover.click();
    },
    // cExample 上传过程
    cExampleUpload: function() {
      var self = this;

      var coverFile = this.$refs.cExampleCover.files[0];

      var uploader = this.tcVod.upload({
        fileId: this.cExampleFileId,
        coverFile: coverFile
      });
      uploader.on("cover_progress", function(info) {
        uploaderInfo.coverProgress = info.percent;
      });
      uploader.on("cover_upload", function(info) {
        uploaderInfo.isCoverUploadSuccess = true;
      });
      console.log(uploader, "uploader");

      var uploaderInfo = {
        coverInfo: uploader.coverInfo,
        isCoverUploadSuccess: false,
        coverProgress: 0,
        coverUrl: "",
        cancel: function() {
          uploader.cancel();
        }
      };

      this.uploaderInfos.push(uploaderInfo);

      uploader.done().then(function(doneResult) {
        console.log("doneResult", doneResult);

        uploaderInfo.coverUrl = doneResult.cover.url;

        self.$refs.cExample.reset();
      });
    }
  }
});
