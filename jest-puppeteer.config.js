const ci = Boolean(process.env.CI || false);
const baseOptions = {
  server: {
    command: 'npm start',
    port: 8000,
    launchTimeout: 30000,
  },
  launch: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
};

const ciPipelineOptions = {
  launch: {
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--ignore-certificate-errors',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  },
  server: baseOptions.server,
};

module.exports = ci ? ciPipelineOptions : baseOptions;
