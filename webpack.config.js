const path = require('path');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/tc_vod.ts',
  watch: true,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  optimization: {
    occurrenceOrder: false,
  },
  output: {
    filename: 'vod-js-sdk-v6.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'TcVod',
    libraryTarget: 'umd',
  }
};