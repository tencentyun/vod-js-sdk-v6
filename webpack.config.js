const path = require("path");

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: "./src/tc_vod.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  optimization: {
    // 这个选项开启后会影响 ts sourcemap 的生成，调试了半天也不懂是为什么。
    occurrenceOrder: false
  },
  output: {
    filename: "vod-js-sdk-v6.js",
    path: path.resolve(__dirname, "dist"),
    library: "TcVod",
    libraryTarget: "umd"
  },
  plugins: []
};
