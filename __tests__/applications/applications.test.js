const puppeteer = require('puppeteer');

const {
  fetchedApplications,
  acceptedApplications,
} = require('../../mock-data/applications');
const { superUserForAudiLogs } = require('../../mock-data/users');

const SITE_URL = 'http://localhost:8000';
// helper/loadEnv.js file causes API_BASE_URL to be stagin-api on local env url in taskRequest/index.html
const API_BASE_URL = 'http://localhost:3000';

describe.only('Applications page', () => {
  let browser;
  let page;

  jest.setTimeout(60000);

  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],

      devtools: false,
    });
  });
  beforeEach(async () => {
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (request) => {
      console.log(request.url(), 'request');
      if (request.url() === `${API_BASE_URL}/applications?size=5`) {
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
      } else if (
        request.url() === `${API_BASE_URL}/applications?size=5&status=accepted`
      ) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ applications: acceptedApplications }),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } else if (request.url() === `${API_BASE_URL}/users/self`) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(superUserForAudiLogs),
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

  it('should render the initial UI elements', async function () {
    const title = await page.$('.header h1');
    const filterButton = await page.$('.filter-button');
    const applicationCards = await page.$$('.application-card');
    expect(title).toBeTruthy();
    expect(filterButton).toBeTruthy();
    expect(applicationCards).toBeTruthy();
    expect(applicationCards.length).toBe(5);
  });

  it('should load and render the accepted application requests when accept is selected from filter, and on clearing the interval it should start showing all requests again', async function () {
    await page.click('.filter-button');
    await page.$eval('input[name="status"][value="accepted"]', (radio) =>
      radio.click(),
    );
    await page.click('.apply-filter-button');
    let applicationCards = await page.$$('.application-card');
    expect(applicationCards.length).toBe(4);

    await page.click('.filter-button');
    // clearing interval here
    await page.waitForTimeout(10000);
    await page.click('.clear-btn');
    await page.waitForTimeout(10000);

    applicationCards = await page.$$('.application-card');
    expect(applicationCards.length).toBe(5);
  });
});
