const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require("webpack-node-externals");
const Dotenv = require('dotenv-webpack');

module.exports = {
  context: __dirname,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  devtool: slsw.lib.webpack.isLocal ? 'cheap-module-eval-source-map' : 'source-map',
  entry: slsw.lib.entries,
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: "node",
  externals: [nodeExternals()],
  plugins: [
    new Dotenv()
  ],
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: "eslint-loader"
      },
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: [
          [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, '.serverless'),
            path.resolve(__dirname, '.webpack'),
          ],
        ],
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        }
      },
      {
        test: /\.graphql$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
    symlinks: false,
    cacheWithContext: false
  }
};
