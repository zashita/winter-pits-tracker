const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";
  const MiniCssExtractPlugin = isProd ? require("mini-css-extract-plugin") : null;
  return {
    entry: path.resolve(__dirname, "src/index.tsx"),
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProd ? "js/[name].[contenthash:8].js" : "js/[name].js",
      publicPath: "/",
      clean: true,
      assetModuleFilename: "assets/[name].[ext]",
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      alias: { "@": path.resolve(__dirname, "src") },
    },
    module: {
      rules: [
        { test: /\.[jt]sx?$/, exclude: /node_modules/, use: "babel-loader" },
        {
          test: /\.module\.(css|scss|sass)$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : "style-loader",
            { loader: "css-loader", options: { modules: { localIdentName: isProd ? "[hash:base64:8]" : "[name]__[local]__[hash:base64:5]" }, importLoaders: 1 } },
            "postcss-loader",
            "sass-loader",
          ],
        },
        { test: /\.css$/, exclude: /\.module\.(css|scss|sass)$/, use: [isProd ? MiniCssExtractPlugin.loader : "style-loader", "css-loader", "postcss-loader"] },
        { test: /\.svg$/, type: "asset/resource", generator: { filename: "assets/svg/[name].[ext]" } },
        { test: /\.(png|jpe?g|gif|webp|avif)$/, type: "asset/resource", generator: { filename: "assets/images/[name].[ext]" } },
        { test: /\.(woff2?|eot|ttf|otf)$/, type: "asset/resource", generator: { filename: "assets/fonts/[name].[ext]" } },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: path.resolve(__dirname, "public/index.html"), favicon: path.resolve(__dirname, "public/favicon.ico") }),
      ...(isProd ? [new MiniCssExtractPlugin({ filename: "css/[name].[contenthash:8].css", chunkFilename: "css/[name].[contenthash:8].chunk.css" })] : []),
    ],
    optimization: {
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          react: { test: /[\\\\/]node_modules[\\\\/](react|react-dom|react-redux)[\\\\/]/, name: "react", chunks: "all" },
          vendors: { test: /[\\\\/]node_modules[\\\\/]/, name: "vendors", chunks: "all", priority: -10 },
        },
      },
      runtimeChunk: "single",
    },
  };
};
