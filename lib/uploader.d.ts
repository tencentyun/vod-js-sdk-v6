export declare type IGetSignature = () => Promise<string>;
export declare type TcVodFileInfo = {
    name: string;
    type: string;
    size: number;
};
interface IApplyData {
    "video": {
        "storageSignature": string;
        "storagePath": string;
    };
    "cover"?: {
        "storageSignature": string;
        "storagePath": string;
    };
    "storageAppId": number;
    "storageBucket": string;
    "storageRegion": string;
    "storageRegionV5": string;
    "domain": string;
    "vodSessionKey": string;
    "tempCertificate": {
        "secretId": string;
        "secretKey": string;
        "token": string;
        "expiredTime": number;
    };
    "appId": number;
    "timestamp": number;
    "StorageRegionV5": string;
}
export interface IUploader {
    getSignature: IGetSignature;
    videoFile?: File;
    coverFile?: File;
    cosSuccess?: Function;
    cosCoverSuccess?: Function;
    progress?: Function;
    coverProgress?: Function;
    videoName?: string;
    fileId?: string;
}
declare class Uploader implements IUploader {
    getSignature: IGetSignature;
    videoFile: File;
    videoInfo: TcVodFileInfo;
    coverFile: File;
    coverInfo: TcVodFileInfo;
    cos: any;
    taskId: string;
    progress: Function;
    coverProgress: Function;
    cosSuccess: Function;
    cosCoverSuccess: Function;
    videoName: string;
    storageName: string;
    fileId: string;
    donePromise: Promise<any>;
    applyRequestTimeout: number;
    applyRequestRetryCount: number;
    commitRequestTimeout: number;
    commitRequestRetryCount: number;
    retryDelay: number;
    constructor(params: IUploader);
    setStorage(name: string, value: string): void;
    getStorage(name: string): string;
    delStorage(name: string): void;
    getStorageNum(): number;
    validateInitParams(params: IUploader): void;
    genFileInfo(): void;
    applyUploadUGC(signature: string, retryCount?: number): Promise<any>;
    uploadToCos(applyData: IApplyData): Promise<void[]>;
    commitUploadUGC(signature: string, vodSessionKey: string, retryCount?: number): Promise<any>;
    start(): void;
    _start(): Promise<any>;
    done(): Promise<any>;
    cancel(): void;
}
export default Uploader;
