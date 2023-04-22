const ci = Boolean(process.env.CI || false);
const baseOptions = {
  server: {
    command: 'npm start',
    port: 8000,
  },
};
const ciPipelineOptions = {
  launch: {
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
    args: [
      '--ignore-certificate-errors',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  },
  server: baseOptions.server,
};
module.exports = ci ? ciPipelineOptions : baseOptions;
