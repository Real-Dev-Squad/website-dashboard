const plugins = [];
// when run in the CI enviroonment
const isCI = Boolean(process.env.CI || false);
// when run locally directly (calling npm start)
const isDevelopment = process.env.NODE_ENV === 'development';
// when run in test environment by jest (npm test)
const isTest = process.env.NODE_ENV === 'test';
if (isTest || isDevelopment || isCI) {
  plugins.push('istanbul');
}
module.exports = {
  plugins: plugins,
};
