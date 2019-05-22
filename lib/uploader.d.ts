/// <reference types="node" />
import { EventEmitter } from 'events';
export declare type IGetSignature = () => Promise<string>;
export declare type TcVodFileInfo = {
    name: string;
    type: string;
    size: number;
};
export declare enum UploaderEvent {
    video_progress = "video_progress",
    media_progress = "media_progress",
    video_upload = "video_upload",
    media_upload = "media_upload",
    cover_progress = "cover_progress",
    cover_upload = "cover_upload"
}
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
    mediaFile?: File;
    coverFile?: File;
    videoName?: string;
    mediaName?: string;
    fileId?: string;
}
declare class Uploader extends EventEmitter implements IUploader {
    getSignature: IGetSignature;
    videoFile: File;
    videoInfo: TcVodFileInfo;
    coverFile: File;
    coverInfo: TcVodFileInfo;
    cos: any;
    taskId: string;
    videoName: string;
    sessionName: string;
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
    validateInitParams(params: IUploader): void;
    genFileInfo(): void;
    applyUploadUGC(retryCount?: number): Promise<any>;
    uploadToCos(applyData: IApplyData): Promise<void[]>;
    commitUploadUGC(vodSessionKey: string, retryCount?: number): Promise<any>;
    start(): void;
    _start(): Promise<any>;
    done(): Promise<any>;
    cancel(): void;
}
export default Uploader;
