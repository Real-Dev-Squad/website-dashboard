const puppeteer = require('puppeteer');
const { filteredUsersData } = require('../../mock-data/users');
const { mockUserData } = require('../../mock-data/users/mockdata');
const API_BASE_URL = 'https://staging-api.realdevsquad.com';

describe('Apply Filter and Pagination Functionality', () => {
  let browser;
  let page;

  jest.setTimeout(60000);

  const BASE_URL = 'http://localhost:8000';

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
    });
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url === `${API_BASE_URL}/users/search/?role=in_discord`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers,
          body: JSON.stringify({
            ...filteredUsersData,
            users: filteredUsersData.users.filter(
              (user) => user.roles.in_discord,
            ),
          }),
        });
      } else if (url === `${API_BASE_URL}/users/search/?verified=true`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers,
          body: JSON.stringify({
            ...filteredUsersData,
            users: [...filteredUsersData.users, ...mockUserData.users],
          }),
        });
      } else {
        interceptedRequest.continue();
      }
    });

    await page.goto(`${BASE_URL}/users/discord/`);
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should render all sections', async () => {
    let tabsSection = await page.$('.tabs_section');
    let usersSection = await page.$('.users_section');
    let firstUser = await page.$('.user_card');
    let userDetailsSection = await page.$('.user_details_section');

    expect(tabsSection).toBeDefined();
    const tabs = await tabsSection.$$('.tab');
    expect(tabs.length).toEqual(2);
    expect(usersSection).toBeDefined();
    expect(userDetailsSection).toBeDefined();
  });

  it('should update the URL query string when applying filters', async () => {
    // select option between 'in discord' and 'linked accounts' from the dropdoen
    await page.waitForSelector('.tabs_section');
    await page.select('.tabs_section', 'verified');

    // get the current URL
    const url = await page.url();
    expect(url).toContain('?tab=verified');
  });
});
