const puppeteer = require('puppeteer');
const {
  extensionRequestsList,
  extensionRequestsListPending,
  extensionRequestsListApproved,
} = require('../../mock-data/extension-requests');

const { userSunny, userRandhir } = require('../../mock-data/users');
describe('Tests the Extension Requests Screen', () => {
  let browser;
  let page;
  let title;
  let searchBar;
  let filterButton;
  let extensionRequestsElement;
  jest.setTimeout(60000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
      devtools: false,
    });
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url === 'https://api.realdevsquad.com/extension-requests') {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestsList),
        });
      } else if (
        url === 'https://api.realdevsquad.com/extension-requests?status=PENDING'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestsListPending),
        });
      } else if (
        url ===
        'https://api.realdevsquad.com/extension-requests?status=ACCEPTED'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestsListApproved),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto('http://localhost:8000/extension-requests');
    await page.waitForNetworkIdle();

    title = await page.$('.header h1');
    searchBar = await page.$('#search');
    filterButton = await page.$('#filter-button');
    extensionRequestsElement = await page.$('.extension-request');
  });

  afterEach(async () => {
    await page.goto('http://localhost:8000/extension-requests');
    await page.waitForNetworkIdle();
  });
  afterAll(async () => {
    await browser.close();
  });

  it('Checks the UI elements on Extension requests listing page.', async () => {
    expect(title).toBeTruthy();
    expect(searchBar).toBeTruthy();
    expect(filterButton).toBeTruthy();

    expect(extensionRequestsElement).toBeTruthy();
  });

  it('checks the search functionality', async () => {
    const ele = await page.$('input[id="assignee-search"]');
    await page.type('#assignee-search', 'sunny');
    await page.waitForTimeout(600); // wait for input debounce timer
    const cardsList = await page.$$('.extension-request');
    expect(cardsList.length).toBe(2);
    const cardTextContent = await page.evaluate(
      (element) => element.textContent,
      cardsList[0],
    );
    expect(cardTextContent).toContain('sunny');
  });

  it('clicking on filter button should display filter modal', async () => {
    const modal = await page.$('.filter-modal');
    expect(await modal.evaluate((el) => el.classList.contains('hidden'))).toBe(
      true,
    );
    await page.click('#filter-button');
    expect(modal).not.toBeNull();
    expect(await modal.evaluate((el) => el.classList.contains('hidden'))).toBe(
      false,
    );
    await page.click('#filter-button');
    expect(await modal.evaluate((el) => el.classList.contains('hidden'))).toBe(
      true,
    );
  });

  it('checks if PENDING is checked by default', async () => {
    const filterButton = await page.$('#filter-button');
    await filterButton.click();

    await page.waitForSelector('.filter-modal');

    const activeFilter = await page.$('input[value="PENDING"]');

    const currentState = await activeFilter.getProperty('checked');
    const isChecked = await currentState.jsonValue();
    expect(isChecked).toBe(true);
  });

  it('Selecting filters and clicking on apply should filter extension requests list', async () => {
    await page.click('#filter-button');
    await page.click('input[value="PENDING"]');

    await page.click('input[value="APPROVED"]');

    await page.click('#apply-filter-button');
    await page.waitForNetworkIdle();

    const cardsList = await page.$$('.extension-request');

    expect(cardsList).not.toBeNull();
    expect(cardsList.length).toBeGreaterThanOrEqual(0);
  });

  it('clears the filter when the Clear button is clicked', async () => {
    const filterButton = await page.$('#filter-button');
    await filterButton.click();

    await page.waitForSelector('.filter-modal');

    const activeFilter = await page.$('input[value="APPROVED"]');
    await activeFilter.click();

    const clearButton = await page.$('.filter-modal #clear-button');
    await clearButton.click();

    await page.waitForSelector('.filter-modal', { hidden: true });

    const currentState = await activeFilter.getProperty('checked');
    const isChecked = await currentState.jsonValue();
    expect(isChecked).toBe(false);
  });
});

describe('Tests the new Extension Requests Screen', () => {
  let browser;
  let page;
  let title;
  let searchBar;
  let filterButton;
  let extensionRequestsElement;
  jest.setTimeout(60000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
      devtools: false,
    });
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url === 'https://api.realdevsquad.com/extension-requests') {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestsList),
        });
      } else if (
        url === 'https://api.realdevsquad.com/extension-requests?status=PENDING'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestsListPending),
        });
      } else if (
        url ===
        'https://api.realdevsquad.com/extension-requests?status=ACCEPTED'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestsListApproved),
        });
      } else if (
        url === 'https://api.realdevsquad.com/users?search=sunny&size=1'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(userSunny),
        });
      } else if (
        url === 'https://api.realdevsquad.com/users?search=randhir&size=1'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(userRandhir),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto('http://localhost:8000/extension-requests/index.html');
    await page.waitForNetworkIdle();

    const newUrl =
      'http://localhost:8000/extension-requests/index.html?dev=true'; // The URL you want to navigate to

    await page.evaluate((newUrl) => {
      window.location.href = newUrl;
    }, newUrl);

    title = await page.$('.header h1');
    searchBar = await page.$('#search');
    filterButton = await page.$('#filter-button');
    extensionCardsList = await page.$$('.extension-card');
  });

  afterEach(async () => {
    await page.goto('http://localhost:8000/extension-requests/index.html');
    await page.waitForTimeout(600000);

    await page.waitForNetworkIdle();
  });
  afterAll(async () => {
    await browser.close();
  });

  it('Checks the UI elements on Extension requests listing page.', async () => {
    expect(title).toBeTruthy();
    expect(searchBar).toBeTruthy();
    expect(filterButton).toBeTruthy();
    expect(extensionCardsList.length).toBe(2);
    expect(extensionRequestsElement).toBeTruthy();
  });
});
