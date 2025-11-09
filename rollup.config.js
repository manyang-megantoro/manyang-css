import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'ManyangCSSHover',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    postcss({
      extensions: ['.css', '.scss'],
      extract: true,
      minimize: true,
    }),
  ],
  watch: {
    include: 'src/**',
  },
};