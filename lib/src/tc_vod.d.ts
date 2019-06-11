import Uploader, { IGetSignature, UploaderOptions } from "./uploader";
interface TcVodParams {
    getSignature: IGetSignature;
    allowReport?: boolean;
}
declare class TcVod {
    getSignature: IGetSignature;
    allowReport: boolean;
    constructor(params: TcVodParams);
    upload(params: UploaderOptions): Uploader;
    initReporter(uploader: Uploader): void;
}
export default TcVod;
