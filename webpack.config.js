const path = require("path");
const glob = require("glob");
const CopyPlugin = require("copy-webpack-plugin");

const srcDir = "./src";
const entries = glob
  .sync("**/*.ts", {
    ignore: "**/_*.ts",
    cwd: srcDir
  })
  .map(function (key) {
    return [key + ".bandle.js", path.resolve(srcDir, key)];
  });

const entryObj = Object.fromEntries(entries);
module.exports = {
  mode: "development",
  entry: entryObj,
  output: {
    path: path.join(__dirname, "public"),
    filename: "[name]"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "./src/manifest.json",
          to: "manifest.json"
        },
        {
          from: "./src/icon16.png",
          to: "icon16.png"
        },
        {
          from: "./src/icon48.png",
          to: "icon48.png"
        },
        {
          from: "./src/icon128.png",
          to: "icon128.png"
        }
      ]
    })
  ]
};
