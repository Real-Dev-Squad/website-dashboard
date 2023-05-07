const puppeteer = require('puppeteer');
const { API_BASE_URL } = require('../../constants');
const { filteredUsersData } = require('../../mock-data/users');

describe('App Component', () => {
  let browser;
  let page;
  let config = {
    launchOptions: {
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
    },
  };
  let tabsSection;
  let usersSection;
  let firstUser;
  let userDetailsSection;

  const BASE_URL = 'http://localhost:8000';
  const API_BASE_URL = 'http://localhost:3000';
  beforeAll(async () => {
    browser = await puppeteer.launch(config.launchOptions);
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url === `${API_BASE_URL}/users/inDiscord`) {
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
      } else if (url === `${API_BASE_URL}/users/verified`) {
      } else {
        interceptedRequest.continue();
      }
    });

    await page.goto(`${BASE_URL}/user-management/`); // Replace with your app's URL
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should render all sections', async () => {
    tabsSection = await page.$('.tabs_section');
    usersSection = await page.$('.users_section');
    firstUser = await page.$('.user_card');
    userDetailsSection = await page.$('.user_details_section');
    expect(tabsSection).toBeDefined();

    expect(usersSection).toBeDefined();

    expect(userDetailsSection).toBeDefined();
  });
});
