module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'module',
    // allowImportExportEverywhere: false,
    // ecmaFeatures: {
    //   globalReturn: false,
    // },
    // babelOptions: {
    //   configFile: 'path/to/config.js',
    // },
  },
  env: {
    browser: true,
    node: true,
    mocha: true,
  },
  globals: {
    expect: true,
    sinon: true,
    __DEV__: true,
  },
  rules: {},
};
