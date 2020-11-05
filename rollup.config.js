import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import pkg from './package.json';


function pgl(plugins=[]) {
  return [
    json(),
    nodeResolve(),
    commonjs(),
    ...plugins
  ];
}

const srcEntry = pkg.source;

export default [
  {
    input: srcEntry,
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    external: [
      'min-dash',
      'ajv',
      'ajv-errors'
    ],
    plugins: pgl()
  }
];