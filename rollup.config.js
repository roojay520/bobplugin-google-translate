// import fs from 'fs-extra';
import path from 'path';
import json from '@rollup/plugin-json';
import esbuild from 'rollup-plugin-esbuild';
import commonjs from '@rollup/plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';

const pkg = 'google-translate.bobplugin';

export default {
  input: path.join(__dirname, './src/main.js'),
  output: {
    format: 'commonjs',
    exports: 'auto',
    file: path.join(__dirname, `./dist/${pkg}/main.js`),
  },
  plugins: [
    copy({
      targets: [
        { src: './src/info.json', dest: `dist/${pkg}/` },
        { src: './src/libs/**/*', dest: `dist/${pkg}/libs` },
      ],
    }),
    json(),
    globals(),
    builtins(),
    resolve(),
    commonjs(),
    esbuild({
      // All options are optional
      include: /\.js$/, // default, inferred from `loaders` option
      exclude: /node_modules/, // default
      watch: process.argv.includes('--watch'),
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
  external: ['crypto-js', '$util'],
};
