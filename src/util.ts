function isFile(v: any): boolean {
  return Object.prototype.toString.call(v) == "[object File]";
}

function isFunction(v: any): boolean {
  return typeof v === "function";
}

function isString(v: any): boolean {
  return typeof v === "string";
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function noop() {}

function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function getUnix() {
  return Math.floor(Date.now() / 1000);
}

enum CLIENT_ERROR_CODE {
  UPLOAD_FAIL = 1
}

export enum HOST {
  MAIN = "vod2.qcloud.com",
  BACKUP = "vod2.dnsv1.com"
}

export default {
  isFile,
  isFunction,
  isString,
  noop,
  delay,
  getUnix,
  isTest: process.env.NODE_ENV === "test",
  isDev: process.env.NODE_ENV === "development",
  CLIENT_ERROR_CODE
};
