const nodeExternals = require("webpack-node-externals");

module.exports = {
  mode: "production",
  target: "node",
  entry: "./index.ts",
  output: {
    path: `${__dirname}/dist`,
    filename: "main.js"
  },
  externals: [nodeExternals()],
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
        use: ["babel-loader", "ts-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".json"]
  }
};
