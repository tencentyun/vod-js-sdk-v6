import Uploader from "./uploader";
interface IVodReporter {
}
export declare enum VodReportEvent {
    report_apply = "report_apply",
    report_cos_upload = "report_cos_upload",
    report_commit = "report_commit"
}
export declare class VodReporter {
    uploader: Uploader;
    options: IVodReporter;
    constructor(uploader: Uploader, options?: IVodReporter);
    init(): void;
    onApply(reportData: any): void;
    onCosUpload(reportData: any): void;
    onCommit(reportData: any): void;
    report(reportData: any): void;
}
export {};
