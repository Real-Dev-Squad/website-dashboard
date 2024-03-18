const puppeteer = require('puppeteer');
const { filteredUsersData } = require('../../mock-data/users');
const { mockUserData } = require('../../mock-data/users/mockdata');
const API_BASE_URL = 'https://staging-api.realdevsquad.com';

describe('App Component', () => {
  let browser;
  let page;
  jest.setTimeout(60000);
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
            users: filteredUsersData.users.filter((user) => user.discordId),
            ...mockUserData,
            users: mockUserData.users.filter((user) => user.discordId),
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

  it('should update the URL query string and re-render the app', async () => {
    // Click on the "Linked Accounts" tab
    await page.click('[data_key="verified"]');

    // Get the current URL and make sure the query string has been updated
    const url = await page.url();
    expect(url).toContain('?tab=verified');
  });

  it('should update the URL query string on search', async () => {
    const initialUrl = await page.url();

    await page.waitForSelector('.search_field');

    await page.type('.search_field', 'John Doe');
    await page.click('.search_button');

    const updatedUrl = await page.url();

    expect(updatedUrl).toContain('search=John+Doe');
  });

  it('should display user details when a user card is clicked', async () => {
    await page.waitForSelector('.active_tab');

    await page.click('.active_tab');

    await page.waitForSelector('.user_details_section');

    const userDetailsDisplayed =
      (await page.$('.user_details_section')) !== null;

    expect(userDetailsDisplayed).toBeTruthy();
  });

  it('should display search results matching the search term', async () => {
    await page.type('.search_field', 'amit');
    await page.click('.search_button');

    await page.waitForSelector('.user_card');

    const userCards = await page.$$('.user_card');
    let searchTermFound = false;

    for (const card of userCards) {
      const cardContent = await card.evaluate((node) => node.innerText);
      if (cardContent.toLowerCase().includes('amit')) {
        searchTermFound = true;
        break;
      }
    }

    expect(searchTermFound).toBeTruthy();
  });

  it('should handle empty search results gracefully', async () => {
    await page.type('.search_field', 'bdhsbhj'); //represents a string which won't yeild any search result
    await page.click('.search_button');

    await page.waitForSelector('.no_users');

    const emptyResultsMessageDisplayed = (await page.$('.no_users')) !== null;

    expect(emptyResultsMessageDisplayed).toBeTruthy();
  });
});
