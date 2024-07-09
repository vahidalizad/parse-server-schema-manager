const babelParser = require('@babel/eslint-parser');

module.exports = {
  languageOptions: {
    parser: babelParser,
    sourceType: 'module',
  },
  rules: {},
};
