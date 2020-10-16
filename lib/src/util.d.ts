declare function isFile(v: any): boolean;
declare function isFunction(v: any): boolean;
declare function isString(v: any): boolean;
declare function noop(): void;
declare function delay(ms: number): Promise<unknown>;
declare function getUnix(): number;
declare enum CLIENT_ERROR_CODE {
    UPLOAD_FAIL = 1
}
export declare enum HOST {
    MAIN = "vod2.qcloud.com",
    BACKUP = "vod2.dnsv1.com"
}
declare const _default: {
    isFile: typeof isFile;
    isFunction: typeof isFunction;
    isString: typeof isString;
    noop: typeof noop;
    delay: typeof delay;
    getUnix: typeof getUnix;
    isTest: boolean;
    isDev: boolean;
    CLIENT_ERROR_CODE: typeof CLIENT_ERROR_CODE;
};
export default _default;
