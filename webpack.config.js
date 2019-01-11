const path = require('path');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/tc_vod.ts',
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
  output: {
    filename: 'tc_vod.js',
    path: path.resolve(__dirname, 'dist')
  }
};