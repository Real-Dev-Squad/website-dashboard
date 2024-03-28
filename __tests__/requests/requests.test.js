const puppeteer = require('puppeteer');
const {
  pendingRequest,
  requestActionResponse,
  approvedRequest,
} = require('../../mock-data/requests');
const { allUsersData } = require('../../mock-data/users');

const API_BASE_URL = 'https://api.realdevsquad.com';
const SITE_URL = 'http://localhost:8000';

describe('Tests the request card', () => {
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

      if (url === `${API_BASE_URL}/users/search?role=in_discord`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(allUsersData),
        });
      } else if (url === `${API_BASE_URL}/requests?dev=true&type=OOO&size=12`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(pendingRequest),
        });
      } else if (
        url === `${API_BASE_URL}/requests/Wl4TTbpSrQDIjs6KLJwD?dev=true`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(requestActionResponse),
        });
      } else if (
        url === `${API_BASE_URL}/requests?dev=true&id=Wl4TTbpSrQDIjs6KLJwD`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(approvedRequest),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto(`${SITE_URL}/requests`);
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should update the card when the accept or reject button is clicked', async () => {
    await page.waitForSelector('.request__status');
    const statusButtonText = await page.$eval(
      '.request__status',
      (el) => el.textContent,
    );
    expect(statusButtonText).toBe('Pending');

    await page.click('.request__action__btn.accept__btn');

    await page.waitForSelector('.request__status');
    const updatedStatusButtonText = await page.$eval(
      '.request__status',
      (el) => el.textContent,
    );
    expect(updatedStatusButtonText).toBe('Approved');
  });
});
