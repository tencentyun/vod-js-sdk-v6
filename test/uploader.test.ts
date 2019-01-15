import * as assert from 'assert'
import Uploader from '../src/uploader'
import util from '../src/util'

const fakeGetSignature = async () => {
  return ''
}
const fakeVideoFile:File = <File>{
  lastModified: null,
  name: 'vv.dd.mp4',
  size: 100,
  type: null,
  slice: null,
  toString() {
    return '[object File]'
  }
};
describe('uploader.test.ts', () => {
  describe('#new', function () {
    it('should accept getSignature and videoFile', () => {
      const uploader = new Uploader({
        getSignature: fakeGetSignature,
        videoFile: fakeVideoFile,
      });
      assert(uploader.progress == util.noop)
    })

    it('should fail when init params wrong')
  })
  describe('#genFileInfo', () => {
    it('should gen file info', () => {
      const uploader = new Uploader({
        getSignature: fakeGetSignature,
        videoFile: fakeVideoFile,
      });
      assert(uploader.videoInfo.name == 'vv.dd')
      assert(uploader.videoInfo.type == 'mp4')
      assert(uploader.videoInfo.size == 100);
    })

    it('should use `videoName`', () => {
      const uploader = new Uploader({
        getSignature: fakeGetSignature,
        videoFile: fakeVideoFile,
        videoName: 'custom_video_name'
      });
      assert(uploader.videoName == 'custom_video_name')
    })

    it('should throw invalid `videoName`', () => {
      assert.throws(() => {
        const uploader = new Uploader({
          getSignature: fakeGetSignature,
          videoFile: fakeVideoFile,
          videoName: 11 as any
        });
      }, /videoName must be a string/)

      assert.throws(() => {
        const uploader = new Uploader({
          getSignature: fakeGetSignature,
          videoFile: fakeVideoFile,
          videoName: '*'
        });
      }, /Cant use these chars in filename/)
    })
  })
})