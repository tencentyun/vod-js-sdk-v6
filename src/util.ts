
function isFile(v: any) {
  return Object.prototype.toString.call(v) == "[object File]"
}

function isFunction(v: any) {
  return typeof v === 'function'
}

function isString(v: any) {
  return typeof v === 'string'
}

function noop() {}

export default {
  isFile,
  isFunction,
  isString,
  noop,
}