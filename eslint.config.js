const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');

module.exports = {
  files: ['src/**/*.{js,ts}'],
  languageOptions: {
    parser: tsParser,
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
