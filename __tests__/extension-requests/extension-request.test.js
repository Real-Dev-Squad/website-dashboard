const puppeteer = require('puppeteer');
const { extensionRequests } = require('../../mock-data/extension-requests');

describe('Extension Request Listing Screen', () => {
  let browser;
  let page;
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
      if (url === 'https://api.realdevsquad.com/extension-requests') {
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
    await page.waitForSelector('.extension-requests');
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should render the extension request cards', async () => {
    const extensionRequestCards = await page.$$('.extension-request');
    expect(extensionRequestCards.length).toBe(
      extensionRequests.allExtensionRequests.length,
    );
  });
});
