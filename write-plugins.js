const fs = require('fs');
fs.writeFileSync('react-webpack-boilerplate/config/build/buildPlugins.ts', 
  "import webpack from 'webpack';\n" +
  "import HTMLWebpackPlugin from 'html-webpack-plugin';\n" +
  "import { BuildOptions } from './types/config';\n" +
  "export function buildPlugins({ paths, isDev }: BuildOptions): webpack.WebpackPluginInstance[] {\n" +
  "  return [\n" +
  "    new HTMLWebpackPlugin({ template: paths.html }),\n" +
  "    new webpack.ProgressPlugin(),\n" +
  "    ...(isDev ? [new webpack.HotModuleReplacementPlugin()] : []),\n" +
  "  ];\n" +
  "}\n"
);
