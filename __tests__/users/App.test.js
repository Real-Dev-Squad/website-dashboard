const puppeteer = require('puppeteer');
const { API_BASE_URL } = require('../../constants');
const { filteredUsersData } = require('../../mock-data/users');

describe('App Component', () => {
  let browser;
  let page;
  let config = {
    launchOptions: {
      headless: false,
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
    },
  };

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
    expect(tabs.length).toEqual(3);

    expect(usersSection).toBeDefined();

    expect(userDetailsSection).toBeDefined();
  });

  it('should update the URL query string and re-render the app', async () => {
    // Click on the "Linked Accounts" tab
    await page.click('[data-key="verified"]');

    // Get the current URL and make sure the query string has been updated
    const url = await page.url();
    expect(url).toContain('?tab=verified');

    // Check that the app has re-rendered with the "Linked Accounts" tab active
    const tabIsActive = await page.evaluate(() => {
      const activeTabId = document
        .querySelector('.tab.active')
        .getAttribute('data-key');
      return activeTabId === 'verified';
    });
    expect(tabIsActive).toBe(true);
  });

  // describe('handleUserSelected', () => {
  //   it('should show the selected User details', async () => {
  //     const rerender = jest.fn();

  //     expect(rerender).toHaveBeenCalled();
  //   });
  // });
});
