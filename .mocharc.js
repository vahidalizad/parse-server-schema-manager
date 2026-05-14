'use strict';

// This is a JavaScript-based config file containing every Mocha option plus others.
// If you need conditional logic, you might want to use this type of config,
// e.g. set options via environment variables 'process.env'.
// Otherwise, JSON or YAML is recommended.

module.exports = {
  diff: true,
  extension: ['js', 'cjs', 'mjs'],
  package: './package.json',
  reporter: 'spec',
  slow: '75',
  timeout: '2000',
  require: [
    '@babel/register',
    'ts-node/register',
    // 'mocha-suppress-logs',
    'test/hooks.js',
  ],
  globals: ['Parse'],
  extensions: ['ts', 'js'],
  exit: true,
  // delay: true,
  'check-leaks': true,
  sort: true,
  spec: 'test/**/*.spec.js',
  // 'watch-files': ['test/**/*.spec.js'],
};
