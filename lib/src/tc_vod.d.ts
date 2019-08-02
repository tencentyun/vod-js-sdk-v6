import Uploader, { IGetSignature, UploaderOptions } from "./uploader";
interface TcVodParams {
    getSignature: IGetSignature;
    allowReport?: boolean;
    appId?: number;
    reportId?: string;
}
declare class TcVod {
    getSignature: IGetSignature;
    allowReport: boolean;
    appId: number;
    reportId: string;
    constructor(params: TcVodParams);
    upload(params: Omit<UploaderOptions, "getSignature">): Uploader;
    initReporter(uploader: Uploader): void;
}
export default TcVod;
