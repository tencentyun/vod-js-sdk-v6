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
export interface UploaderOptions {
    getSignature: IGetSignature;
    videoFile?: File;
    mediaFile?: File;
    coverFile?: File;
    videoName?: string;
    mediaName?: string;
    fileId?: string;
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
    fileId: string;
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
    applyUploadUGC(retryCount?: number): Promise<any>;
    uploadToCos(): Promise<void[]>;
    commitUploadUGC(retryCount?: number): Promise<any>;
    start(): void;
    _start(): Promise<any>;
    done(): Promise<any>;
    cancel(): void;
}
export default Uploader;
