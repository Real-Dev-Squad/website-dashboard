const puppeteer = require('puppeteer');
const { filteredUsersData } = require('../../mock-data/users');
const { mockUserData } = require('../../mock-data/users/mockdata');
const API_BASE_URL = 'https://staging-api.realdevsquad.com';

describe('App Component', () => {
  let browser;
  let page;
  jest.setTimeout(90000);
  let config = {
    launchOptions: {
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
    },
  };

  const BASE_URL = 'http://localhost:8000';

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  beforeAll(async () => {
    browser = await puppeteer.launch(config.launchOptions);
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
            ...mockUserData,
            users: [
              ...filteredUsersData.users.filter(
                (user) => user.roles.in_discord,
              ),
              ...mockUserData.users.filter((user) => user.roles.in_discord),
            ],
          }),
        });
      } else if (url === `${API_BASE_URL}/users/search/?verified=true`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers,
          body: JSON.stringify({
            ...filteredUsersData,
            ...mockUserData,
            users: [
              ...filteredUsersData.users.filter((user) => user.discordId),
              ...mockUserData.users.filter((user) => user.discordId),
            ],
          }),
        });
      } else {
        interceptedRequest.continue();
      }
    });

    await page.goto(`${BASE_URL}/users/discord/`); // Replace with your app's URL
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });
  it('should fetch and append new users on subsequent pages for both tabs', async () => {
    await page.goto(`${BASE_URL}/users/discord/?tab=in_discord&dev=true`);
    await page.waitForNetworkIdle();

    const userCardTestIds = await page.$$eval(
      '[data-testid^="user-card-"]',
      (cards) => cards.map((card) => card.getAttribute('data-testid')),
    );
    console.log(userCardTestIds.length, 'user length');
    expect(userCardTestIds.length).toBe(2);
  });

  it('should render all sections', async () => {
    await page.waitForSelector('.tabs_section');
    await page.waitForSelector('.users_section');
    await page.waitForSelector('.user_card');
    await page.waitForSelector('.user_details_section');

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

  it('should update the URL query string and re-render the app', async () => {
    await page.waitForSelector('[data_key="verified"]');

    // Click on the "Linked Accounts" tab
    await page.click('[data_key="verified"]');

    // Get the current URL and make sure the query string has been updated
    const url = await page.url();
    expect(url).toContain('?tab=verified');
  });

  it('should handle user card clicks and apply active_tab class to clicked card only in discord tab', async () => {
    await page.goto(`${BASE_URL}/users/discord/?tab=in_discord`);
    await page.waitForNetworkIdle();
    await page.waitForSelector('.user_card[data-key]');
    const userCardTestIds = await page.$$eval(
      '[data-testid^="user-card-"]',
      (cards) => cards.map((card) => card.getAttribute('data-testid')),
    );
    for (let i = 0; i < userCardTestIds.length; i++) {
      const userCardSelector = `[data-testid="${userCardTestIds[i]}"]`;
      const userCardElement = await page.$(userCardSelector);
      await userCardElement.click();
      await page.waitForTimeout(1000);
      const isActive = await page.evaluate((selector) => {
        return document
          .querySelector(selector)
          ?.classList.contains('active_tab');
      }, userCardSelector);
      expect(isActive).toBe(true);
    }
  });

  it('should handle user card clicks and apply active_tab class to clicked card only verified tab', async () => {
    await page.goto(`${BASE_URL}/users/discord/?tab=verified`);
    await page.waitForNetworkIdle();
    await page.waitForSelector('.user_card[data-key]');
    const userCardTestIds = await page.$$eval(
      '[data-testid^="user-card-"]',
      (cards) => cards.map((card) => card.getAttribute('data-testid')),
    );
    for (let i = 0; i < userCardTestIds.length; i++) {
      const userCardSelector = `[data-testid="${userCardTestIds[i]}"]`;
      const userCardElement = await page.$(userCardSelector);
      await userCardElement.click();
      await page.waitForTimeout(1000);
      const isActive = await page.evaluate((selector) => {
        return document
          .querySelector(selector)
          ?.classList.contains('active_tab');
      }, userCardSelector);
      expect(isActive).toBe(true);
    }
  });
});
