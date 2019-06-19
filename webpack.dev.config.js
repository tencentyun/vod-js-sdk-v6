const webpackProdConfig = require("./webpack.config");

const webpackDevConfig = { ...webpackProdConfig, mode: "development" };

module.exports = webpackDevConfig;
