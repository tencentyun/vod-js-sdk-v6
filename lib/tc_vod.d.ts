import Uploader, { IGetSignature, IUploader } from './uploader';
interface ITcVod {
    getSignature: IGetSignature;
}
declare class TcVod {
    getSignature: IGetSignature;
    constructor(params: ITcVod);
    upload(params: IUploader): Uploader;
}
export default TcVod;
