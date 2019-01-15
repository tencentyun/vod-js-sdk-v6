
function isFile(v: any) {
  return Object.prototype.toString.call(v) == "[object File]"
}

function isFunction(v: any) {
  return Object.prototype.toString.call(v) == "[object Function]"
}

function isString(v: any) {
  return Object.prototype.toString.call(v) == "[object String]"
}

function noop() {}

export default {
  isFile,
  isFunction,
  isString,
  noop,
}