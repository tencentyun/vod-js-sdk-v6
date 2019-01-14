
function isFile(v: any) {
  return Object.prototype.toString.call(v) == "[object File]"
}

function noop() {}

export default {
  isFile,
  noop,
}