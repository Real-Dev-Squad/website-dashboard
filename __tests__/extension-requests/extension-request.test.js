const API_BASE_URL = 'https://api.realdevsquad.com';
const puppeteer = require('puppeteer');
const { extensionRequests } = require('../../mock-data/extension-requests');

describe('Extension Request Listing Screen', () => {
  let browser;
  let page;
  let extensionRequests1;
  jest.setTimeout(60000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
      devtools: false,
    });
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url === `${API_BASE_URL}/extension-requests`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequests),
        });
      } else {
        interceptedRequest.continue();
      }
    });

    await page.goto('http://localhost:8000/extension-requests');
    await page.waitForNetworkIdle();

    extensionRequests1 = await page.$('.extension-requests');
  });

  afterAll(async () => {
    await browser.close();
  });

  it('Checks the extension request listing page.', async () => {
    expect(extensionRequests1).toBeTruthy();
  });
});
