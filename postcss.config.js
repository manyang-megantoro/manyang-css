const prefixSelector = require('postcss-prefix-selector');

module.exports = {
  plugins: [
    prefixSelector({
      prefix: '.my-',
      skipGlobalSelectors: true,
      transform(prefix, selector, prefixedSelector, filePath, rule) {
        // Prefix every class selector as a single class
        return selector.replace(/\.(\w+)/g, `${prefix}$1`);
        // return prefixedSelector
      }
    }),
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default'
    })
  ]
};