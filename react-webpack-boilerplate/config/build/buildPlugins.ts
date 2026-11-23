import webpack from 'webpack';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { BuildOptions } from './types/config';
export function buildPlugins({ paths, isDev }: BuildOptions): webpack.WebpackPluginInstance[] {
  const environment = (globalThis as any).process?.env || {};
  const yandexMapsApiUrl = environment.YANDEX_MAPS_API_URL;
  const yandexMapsApiKey = environment.YANDEX_MAPS_API_KEY;
  const yandexMapsLanguage = environment.YANDEX_MAPS_LANGUAGE;
  const missing = [
    !yandexMapsApiUrl && 'YANDEX_MAPS_API_URL',
    !yandexMapsApiKey && 'YANDEX_MAPS_API_KEY',
    !yandexMapsLanguage && 'YANDEX_MAPS_LANGUAGE',
  ].filter(Boolean);
  if (missing.length) {
    throw new Error(`Missing ${missing.join(', ')}. Copy .env.example to .env.local and configure Yandex Maps.`);
  }

  return [
    new HTMLWebpackPlugin({ template: paths.html }),
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
        __IS_DEV__: JSON.stringify(isDev),
        __YANDEX_MAPS_API_URL__: JSON.stringify(yandexMapsApiUrl),
        __YANDEX_MAPS_API_KEY__: JSON.stringify(yandexMapsApiKey),
        __YANDEX_MAPS_LANGUAGE__: JSON.stringify(yandexMapsLanguage),
    }),
    ...(!isDev ? [new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash].css' })] : []),
    ...(isDev ? [new webpack.HotModuleReplacementPlugin()] : []),
  ];
}
