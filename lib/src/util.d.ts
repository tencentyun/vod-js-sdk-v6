declare function isFile(v: any): boolean;
declare function isFunction(v: any): boolean;
declare function isString(v: any): boolean;
declare function noop(): void;
declare function delay(ms: number): Promise<unknown>;
declare enum CLIENT_ERROR_CODE {
    UPLOAD_FAIL = 1
}
declare const _default: {
    isFile: typeof isFile;
    isFunction: typeof isFunction;
    isString: typeof isString;
    noop: typeof noop;
    delay: typeof delay;
    isTest: boolean;
    isDev: boolean;
    CLIENT_ERROR_CODE: typeof CLIENT_ERROR_CODE;
};
export default _default;
