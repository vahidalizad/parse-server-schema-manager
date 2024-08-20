const babelParser = require('@babel/eslint-parser');
const globals = require('globals');

module.exports = {
  languageOptions: {
    parser: babelParser,
    sourceType: 'module',
    globals: {
      ...globals.node,
      Parse: true,
    },
  },
  rules: {
    'no-undef': 'error',
  },
};
