/// <reference types="node" />
import { EventEmitter } from "events";
export declare type IGetSignature = () => Promise<string>;
export interface TcVodFileInfo {
    name: string;
    type: string;
    size: number;
}
export declare enum UploaderEvent {
    video_progress = "video_progress",
    media_progress = "media_progress",
    video_upload = "video_upload",
    media_upload = "media_upload",
    cover_progress = "cover_progress",
    cover_upload = "cover_upload"
}
interface IApplyData {
    video: {
        storageSignature: string;
        storagePath: string;
    };
    cover?: {
        storageSignature: string;
        storagePath: string;
    };
    storageAppId: number;
    storageBucket: string;
    storageRegion: string;
    storageRegionV5: string;
    domain: string;
    vodSessionKey: string;
    tempCertificate: {
        secretId: string;
        secretKey: string;
        token: string;
        expiredTime: number;
    };
    appId: number;
    timestamp: number;
    StorageRegionV5: string;
}
export interface UploaderOptions {
    getSignature: IGetSignature;
    videoFile?: File;
    mediaFile?: File;
    coverFile?: File;
    videoName?: string;
    mediaName?: string;
    fileId?: string;
    appId?: number;
    reportId?: string;
    applyRequestTimeout?: number;
    commitRequestTimeout?: number;
    retryDelay?: number;
}
declare class Uploader extends EventEmitter implements UploaderOptions {
    getSignature: IGetSignature;
    videoFile: File;
    videoInfo: TcVodFileInfo;
    coverFile: File;
    coverInfo: TcVodFileInfo;
    cos: any;
    taskId: string;
    videoName: string;
    sessionName: string;
    vodSessionKey: string;
    appId: number;
    fileId: string;
    reqKey: string;
    reportId: string;
    donePromise: Promise<any>;
    applyRequestTimeout: number;
    applyRequestRetryCount: number;
    commitRequestTimeout: number;
    commitRequestRetryCount: number;
    retryDelay: number;
    constructor(params: UploaderOptions);
    setStorage(name: string, value: string): void;
    getStorage(name: string): string;
    delStorage(name: string): void;
    validateInitParams(params: UploaderOptions): void;
    genFileInfo(): void;
    applyUploadUGC(retryCount?: number): Promise<IApplyData>;
    uploadToCos(applyData: IApplyData): Promise<void[]>;
    commitUploadUGC(retryCount?: number): Promise<any>;
    start(): void;
    _start(): Promise<any>;
    done(): Promise<any>;
    cancel(): void;
}
export default Uploader;
