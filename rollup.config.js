// import fs from 'fs-extra';
import path from 'path';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import esbuild from 'rollup-plugin-esbuild';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-node-polyfills';

const pkg = 'google-translate.bobplugin';

export default {
  input: path.join(__dirname, './src/main.ts'),
  output: {
    format: 'cjs',
    exports: 'auto',
    file: path.join(__dirname, `./dist/${pkg}/main.js`),
  },
  plugins: [
    copy({
      targets: [
        { src: './src/info.json', dest: `dist/${pkg}/` },
        { src: './src/libs', dest: `dist/${pkg}/libs` },
      ],
    }),
    json({ namedExports: false }),
    resolve({
      extensions: ['.js', '.ts'],
      modulesOnly: true,
      preferBuiltins: true,
    }),
    commonjs(),
    nodePolyfills(),
    esbuild({
      // All options are optional
      include: /\.[jt]?s$/, // default, inferred from `loaders` option
      exclude: /node_modules/, // default
      sourceMap: false, // default
      minify: process.env.NODE_ENV === 'production',
      target: 'es6', // default, or 'es20XX', 'esnext',
      // Add extra loaders
      loaders: {
        // Add .json files support
        // require @rollup/plugin-commonjs
        '.json': 'json',
      },
    }),
  ],
  external: ['crypto-js', '$http', '$info', '$option', '$log', '$data', '$file'],
};
