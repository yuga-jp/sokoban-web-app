import path from "path";

const config = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    path: path.resolve(import.meta.dirname, "dist"),
    filename: "main.js"
  },
  resolve: {
    alias: {
      src: path.resolve(import.meta.dirname, "src/"),
      assets: path.resolve(import.meta.dirname, "assets/")
    },
    extensions: [".ts"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(txt|svg)$/,
        type: "asset/resource"
      },
    ]
  },
};

export default config;
