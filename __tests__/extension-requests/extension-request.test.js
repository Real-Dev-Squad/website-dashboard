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
  });

  afterAll(async () => {
    await browser.close();
  });

  it('renders the extension card and redirects on title click', async () => {
    const extensionRequestCard = await page.$('.extension-request');

    expect(extensionRequestCard).toBeTruthy();

    const titleLink = await extensionRequestCard.$('a');
    const titleLinkHref = await page.evaluate((el) => el.href, titleLink);

    expect(titleLinkHref).toBe(
      'https://status.realdevsquad.com/tasks/hlB0vSB5WsZPKcRVGKiA',
    );

    await titleLink.click();

    await page.waitForNavigation();

    const currentURL = await page.url();

    expect(currentURL).toBe(
      'https://status.realdevsquad.com/tasks/hlB0vSB5WsZPKcRVGKiA',
    );
  });
});
