import util from "../src/util";

// though implement `toString`, `Object.prototype.toString.call` would not use it.
util.isFile = function(v: any) {
  return String(v) === "[object File]";
};
