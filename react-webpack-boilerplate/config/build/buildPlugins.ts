import webpack from 'webpack';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import { BuildOptions } from './types/config';
export function buildPlugins({ paths, isDev }: BuildOptions): webpack.WebpackPluginInstance[] {
  return [
    new HTMLWebpackPlugin({ template: paths.html }),
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
        __IS_DEV__: JSON.stringify(isDev),
        __YANDEX_MAPS_API_KEY__: JSON.stringify('0ef0e12b-eac8-439d-96da-4c4a61e8258c'),
    }),
    ...(isDev ? [new webpack.HotModuleReplacementPlugin()] : []),
  ];
}
