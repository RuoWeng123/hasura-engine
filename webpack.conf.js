const path = require('path')

module.exports = {
  entry: path.resolve(__dirname, "./src/main.js"),
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: 'Engine.js',
    libraryTarget: "umd"
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: [path.resolve(__dirname, './node_modules')]
    }]
  }
}
