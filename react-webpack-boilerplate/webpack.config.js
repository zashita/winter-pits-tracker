require('ts-node').register({compilerOptions:{module:'commonjs'}});
const path = require('path');
const { buildWebpackConfig } = require('./config/build/buildWebpackConfig');
module.exports = (env) => {
  const paths = {
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
    build: path.resolve(__dirname, 'build'),
    html: path.resolve(__dirname, 'public', 'index.html'),
    src: path.resolve(__dirname, 'src')
  };
  const mode = (env && env.mode) || 'development';
  const isDev = mode === 'development';
  const port = (env && env.port) || 3000;
  return buildWebpackConfig({ mode, paths, isDev, port });
};
