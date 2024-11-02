const puppeteer = require('puppeteer');
const { filteredUsersData } = require('../../mock-data/users');
const { mockUserData } = require('../../mock-data/users/mockdata');
const { getUsers } = require('../../users/discord/utils/util');
const { paginateFetchedUsers } = require('../../users/discord/App');
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
  it('should fetch and append new users on subsequent pages for both tabs', async () => {
    // Mock the getUsers function to return full set of user data.
    jest.spyOn(global, getUsers).mockResolveValue([mockUserData]);

    // test in_discord tab
    await paginateFetchedUsers('in_discord', 1);
    expect(usersData['in_discord'].length).toBe(10);
    expect(currentPage).toBe(1);

    await paginateFetchedUsers('in_discord', 2);
    expect(usersData['in_discord'].length).toBe(20);
    expect(currentPage).toBe(2);

    // test verified tab
    await paginateFetchedUsers('verified', 1);
    expect(usersData['verified'].length).toBe(10);
    expect(currentPage).toBe(1);

    await paginateFetchedUsers('verified', 2);
    expect(usersData['verified'].length).toBe(20);
    expect(currentPage).toBe(2);
  });
});
