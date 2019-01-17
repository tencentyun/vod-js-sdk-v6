
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

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms);
  })
}

export default {
  isFile,
  isFunction,
  isString,
  noop,
  delay
}