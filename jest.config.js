const config = {
  preset: 'jest-puppeteer',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*'],
  reporters: ['default'],
  coverageDirectory: 'coverage',
};
module.exports = config;
