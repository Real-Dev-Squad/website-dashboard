const puppeteer = require('puppeteer');

const { fetchedApplications } = require('../../mock-data/applications');

const SITE_URL = 'http://localhost:8000';
// helper/loadEnv.js file causes API_BASE_URL to be stagin-api on local env url in taskRequest/index.html
const API_BASE_URL = 'https://staging-api.realdevsquad.com';

describe('Applications page', () => {
  let browser;
  let page;

  jest.setTimeout(60000);

  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
      devtools: false,
    });
  });
  beforeEach(async () => {
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (request) => {
      if (
        request.url() === `${API_BASE_URL}/applications?size=5` ||
        request.url() ===
          `${API_BASE_URL}/applications?size=${size}&status=${applicationStatus}`
      ) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ applications: fetchedApplications }),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } else {
        request.continue();
      }
    });
    await page.goto(`${SITE_URL}/applications`);
    await page.waitForNetworkIdle();
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });
});
