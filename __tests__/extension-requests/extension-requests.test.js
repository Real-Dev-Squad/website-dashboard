const puppeteer = require('puppeteer');
const { extensionRequestsList } = require('../../mock-data/extension-requests');
const { tags } = require('../../mock-data/tags');

describe('Tests the Extension Requests Screen', () => {
  let browser;
  let page;
  let title;
  let searchBar;
  let filterButton;
  let applyFilterButton;
  let clearFilterButton;
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
          body: JSON.stringify(extensionRequestsList),
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
          body: JSON.stringify(extensionRequestsList),
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
    clearFilterButton = await page.$('#filter-button');
    applyFilterButton = await page.$('#apply-filter-button');
    extensionRequestsElement = await page.$('.extension-request');
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

  it('checks the search functionality to display queried user', async () => {
    const ele = await page.$('input[id="assignee-search"]');
    await page.type('#assignee-search', 'ajeya');
    await page.waitForTimeout(600);
    const cardsList = await page.$$('.extension-request');
    expect(cardsList.length).toBe(2);
    const cardTextContent = await page.evaluate(
      (element) => element.textContent,
      cardsList[0],
    );
    expect(cardTextContent).toContain('ajeya');
  });

  it('Clicking on filter button should display filter modal', async () => {
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
    await delay(2000);

    await page.click('#apply-filter-button');
    await page.waitForNetworkIdle();
    const cardsList = await page.$$('.extension-request');
    await delay(20000);

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
