const config = {
  preset: 'jest-puppeteer',
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Add transform for ES Modules
  },
  transformIgnorePatterns: [
    'node_modules/(?!(module-that-needs-transpiling)/)',
  ],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*'],
  reporters: ['default'],
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  testEnvironment: 'node',
};
module.exports = config;
