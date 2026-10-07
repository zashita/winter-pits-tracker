const fs = require('fs');
fs.writeFileSync('react-webpack-boilerplate/config/build/buildPlugins.ts',
"import webpack from 'webpack';\n" +
"import HTMLWebpackPlugin from 'html-webpack-plugin';\n" +
"import { BuildOptions } from './types/config';\n" +
"export function buildPlugins({ paths, isDev }: BuildOptions): webpack.WebpackPluginInstance[] {\n" +
"  return [\n" +
"    new HTMLWebpackPlugin({ template: paths.html }),\n" +
"    new webpack.ProgressPlugin(),\n" +
"    new webpack.DefinePlugin({\n" +
"        __IS_DEV__: JSON.stringify(isDev),\n" +
"        __YANDEX_MAPS_API_KEY__: JSON.stringify('0ef0e12b-eac8-439d-96da-4c4a61e8258c'),\n" +
"    }),\n" +
"    ...(isDev ? [new webpack.HotModuleReplacementPlugin()] : []),\n" +
"  ];\n" +
"}\n");
