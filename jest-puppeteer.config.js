const ci = Boolean(process.env.CI || false);
const baseOptions = {
  server: {
    command: 'npm start',
    port: 8000,
    launchTimeout: 30000,
  },
};
const ciPipelineOptions = {
  launch: {
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
    args: [
      '--ignore-certificate-errors',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
    ],
  },
  server: baseOptions.server,
};
module.exports = ci ? ciPipelineOptions : baseOptions;
