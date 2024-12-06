const puppeteer = require('puppeteer');
const { filteredUsersData } = require('../../mock-data/users');
const { mockUserData } = require('../../mock-data/users/mockdata');
const {
  STAGING_API_URL,
  LOCAL_TEST_PAGE_URL,
} = require('../../mock-data/constants');

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
      if (url === `${STAGING_API_URL}/users/search/?role=in_discord`) {
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
      } else if (url === `${STAGING_API_URL}/users/search/?verified=true`) {
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

    await page.goto(`${LOCAL_TEST_PAGE_URL}/users/discord/`); // Replace with your app's URL
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });
  it('should fetch and append new users on subsequent pages for discord users tab when feature flag is on', async () => {
    await page.goto(`${BASE_URL}/users/discord/?tab=in_discord&dev=true`);
    await page.waitForNetworkIdle();

    const initialUserCardTestIds = await page.$$eval(
      '[data-testid^="user-card-"]',
      (cards) => cards.map((card) => card.getAttribute('data-testid')),
    );
    expect(initialUserCardTestIds.length).toBeLessThanOrEqual(10);
    expect(initialUserCardTestIds.length).toBeGreaterThan(0);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForNetworkIdle();

    const updatedUserCardTestIds = await page.$$eval(
      '[data-testid^="user-card-"]',
      (cards) => cards.map((card) => card.getAttribute('data-testid')),
    );
    expect(updatedUserCardTestIds.length).toBeLessThanOrEqual(20);
    expect(updatedUserCardTestIds.length).toBeGreaterThanOrEqual(
      initialUserCardTestIds.length,
    );
  });
  it('should fetch and append new users on subsequent pages for discord users tab', async () => {
    await page.goto(`${BASE_URL}/users/discord/?tab=in_discord`);
    await page.waitForNetworkIdle();

    const initialUserCardTestIds = await page.$$eval(
      '[data-testid^="user-card-"]',
      (cards) => cards.map((card) => card.getAttribute('data-testid')),
    );
    expect(initialUserCardTestIds.length).toBeLessThanOrEqual(10);
    expect(initialUserCardTestIds.length).toBeGreaterThan(0);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForNetworkIdle();

    const updatedUserCardTestIds = await page.$$eval(
      '[data-testid^="user-card-"]',
      (cards) => cards.map((card) => card.getAttribute('data-testid')),
    );
    expect(updatedUserCardTestIds.length).toBeLessThanOrEqual(20);
    expect(updatedUserCardTestIds.length).toBeGreaterThanOrEqual(
      initialUserCardTestIds.length,
    );
  });
  it('should fetch and append new users on subsequent pages for verified users tab when feature flag is on', async () => {
    await page.goto(`${BASE_URL}/users/discord/?tab=verified&dev=true`);
    await page.waitForNetworkIdle();

    const initialUserCardTestIds = await page.$$eval(
      '[data-testid^="user-card-"]',
      (cards) => cards.map((card) => card.getAttribute('data-testid')),
    );
    expect(initialUserCardTestIds.length).toBeLessThanOrEqual(10);
    expect(initialUserCardTestIds.length).toBeGreaterThan(0);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForNetworkIdle();

    const updatedUserCardTestIds = await page.$$eval(
      '[data-testid^="user-card-"]',
      (cards) => cards.map((card) => card.getAttribute('data-testid')),
    );
    expect(updatedUserCardTestIds.length).toBeLessThanOrEqual(20);
    expect(updatedUserCardTestIds.length).toBeGreaterThanOrEqual(
      initialUserCardTestIds.length,
    );
  });
  it('should fetch and append new users on subsequent pages for verified users tab', async () => {
    await page.goto(`${BASE_URL}/users/discord/?tab=verified`);
    await page.waitForNetworkIdle();

    const initialUserCardTestIds = await page.$$eval(
      '[data-testid^="user-card-"]',
      (cards) => cards.map((card) => card.getAttribute('data-testid')),
    );
    expect(initialUserCardTestIds.length).toBeLessThanOrEqual(10);
    expect(initialUserCardTestIds.length).toBeGreaterThan(0);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForNetworkIdle();

    const updatedUserCardTestIds = await page.$$eval(
      '[data-testid^="user-card-"]',
      (cards) => cards.map((card) => card.getAttribute('data-testid')),
    );
    expect(updatedUserCardTestIds.length).toBeLessThanOrEqual(20);
    expect(updatedUserCardTestIds.length).toBeGreaterThanOrEqual(
      initialUserCardTestIds.length,
    );
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
    await page.waitForSelector('[data-testid="tabs-section-select"]');
    await page.select('[data-testid="tabs-section-select"]', 'verified');

    // Get the current URL and make sure the query string has been updated
    const url = await page.url();
    expect(url).toContain('?tab=verified');
  });

  it('should handle user card clicks and apply active_tab class to clicked card only in discord tab', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/users/discord/?tab=in_discord`);
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
    await page.goto(`${LOCAL_TEST_PAGE_URL}/users/discord/?tab=verified`);
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
