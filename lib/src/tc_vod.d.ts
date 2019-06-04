import Uploader, { IGetSignature, UploaderOptions } from "./uploader";
interface TcVodParams {
    getSignature: IGetSignature;
}
declare class TcVod {
    getSignature: IGetSignature;
    constructor(params: TcVodParams);
    upload(params: UploaderOptions): Uploader;
    initReporter(uploader: Uploader): void;
}
export default TcVod;
