module.exports = function (config) {
  config.set({
    files: [
      'src/**/*.ts',
      'test/**/*.spec.*',
      'test/**/*.ts',
      '!src/index.ts',
      {pattern: 'test/**/*.csv', included: false, mutate: false},
      {pattern: 'test/**/*.json', included: false, mutate: false},
      {pattern: 'test/**/*.xlsx', included: false, mutate: false}
    ],
    testRunner: 'mocha',
    mutator: 'typescript',
    transpilers: ['typescript'],
    reporter: ['html', 'clear-text', 'progress'],
    testFramework: 'mocha',
    coverageAnalysis: 'off',
    tsconfigFile: 'tsconfig.json',
    mutate: ['src/**/*.ts', '!src/index.ts', '!src/types/**/*d.ts']
  });
};
