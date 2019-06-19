import Uploader from "./uploader";
interface IVodReporter {
}
export declare enum VodReportEvent {
    report_apply = "report_apply",
    report_cos_upload = "report_cos_upload",
    report_commit = "report_commit",
    report_done = "report_done"
}
interface ReportObj {
    err: any;
    requestStartTime: Date;
    data: any;
}
export declare class VodReporter {
    uploader: Uploader;
    options: IVodReporter;
    baseReportData: any;
    reportUrl: string;
    constructor(uploader: Uploader, options?: IVodReporter);
    init(): void;
    onApply(reportObj: ReportObj): void;
    onCosUpload(reportObj: ReportObj): void;
    onCommit(reportObj: ReportObj): void;
    onDone(reportObj: ReportObj): void;
    report(reportData: any): void;
    send(reportData: any): void;
}
export {};
