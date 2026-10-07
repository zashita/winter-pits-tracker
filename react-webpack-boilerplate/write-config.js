const fs = require('fs');
fs.writeFileSync('react-webpack-boilerplate/webpack.config.js',
"require('ts-node').register({compilerOptions:{module:'commonjs'}});\n" +
"const path = require('path');\n" +
"const { buildWebpackConfig } = require('./config/build/buildWebpackConfig');\n" +
"module.exports = (env) => {\n" +
"  const paths = {\n" +
"    entry: path.resolve(__dirname, 'src', 'index.tsx'),\n" +
"    build: path.resolve(__dirname, 'build'),\n" +
"    html: path.resolve(__dirname, 'public', 'index.html'),\n" +
"    src: path.resolve(__dirname, 'src')\n" +
"  };\n" +
"  const mode = (env && env.mode) || 'development';\n" +
"  const isDev = mode === 'development';\n" +
"  const port = (env && env.port) || 3000;\n" +
"  return buildWebpackConfig({ mode, paths, isDev, port });\n" +
"};\n");
