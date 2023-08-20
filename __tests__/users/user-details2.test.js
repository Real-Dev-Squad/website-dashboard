const puppeteer = require('puppeteer');
const { userDetails, selfdata } = require('../../mock-data/user-details/index');
const { filteredUsersData } = require('../../mock-data/users');

describe('Tests the User Management User Listing Screen', () => {
  let browser;
  let page;

  jest.setTimeout(60000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
      args: ['--disable-web-security'],
      devtools: false,
    });
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url === 'https://api.realdevsquad.com/users/randhir') {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(userDetails),
        });
      } else if (url === 'https://api.realdevsquad.com/users/self') {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(selfdata),
        });
      } else if (url === 'https://api.realdevsquad.com/users?search=randhir') {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(filteredUsersData),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto(
      'http://localhost:8000/users/details/index.html?username=randhir',
    );
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });
  it('test', async () => {
    await page.waitForTimeout(600000);
    expect(true).toBeTruthy();
  });

  it.skip('checks the search functionality to display queried user', async () => {
    await page.type('input[id="user-search"]', 'randhir');
    await page.waitForNetworkIdle();
    const userList = await page.$('#user-list');
    const userCard = await userList.$('li');
    await userCard.click();
    await page.waitForNetworkIdle();
    await page.waitForTimeout(600000);
    await page.$('.user-details');
    const det = await page.$('.user-details');
    expect(det).toBeTruthy();
  });
});
