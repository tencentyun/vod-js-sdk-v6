import Uploader, {IGetSignature, IUploader} from './uploader'

interface ITcVod {
  getSignature: IGetSignature
}
class TcVod {
  getSignature: IGetSignature;
  constructor(params: ITcVod) {
    this.getSignature = params.getSignature;
  }

  upload(params: IUploader) {
    params = {getSignature: this.getSignature, ...params,}
    const uploader = new Uploader(params);
    uploader.start()
    return uploader
  }
}

export default TcVod