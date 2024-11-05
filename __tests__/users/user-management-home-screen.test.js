const puppeteer = require('puppeteer');
const { allUsersData, filteredUsersData } = require('../../mock-data/users');
const { tags } = require('../../mock-data/tags');

describe('Tests the User Management User Listing Screen', () => {
  let browser;
  let page;
  let userListElement;
  let tileViewBtn;
  let tableViewBtn;
  let userSearchElement;
  jest.setTimeout(60000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
      devtools: false,
    });
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url === 'https://api.realdevsquad.com/users?size=100&page=0') {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(allUsersData),
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
      } else if (url === 'https://api.realdevsquad.com/tags') {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(tags),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto('http://localhost:8000/users');
    await page.waitForNetworkIdle();

    userListElement = await page.$('#user-list');
    tileViewBtn = await page.$('#tile-view-btn');
    tableViewBtn = await page.$('#table-view-btn');
    userSearchElement = await page.$('#user-search');
  });

  afterAll(async () => {
    await browser.close();
  });

  it('Checks the UI elements on user listing page.', async () => {
    expect(userListElement).toBeTruthy();
    expect(tileViewBtn).toBeTruthy();
    expect(tableViewBtn).toBeTruthy();
    expect(userSearchElement).toBeTruthy();
  });

  it('Check the UI interactions of tile view and table view button.', async () => {
    await tileViewBtn.click();
    const activeTileView = await page.$('.btn-active');
    expect(activeTileView).toBeTruthy();
    expect(activeTileView).toEqual(tileViewBtn);

    await tableViewBtn.click();
    const activeTableView = await page.$('.btn-active');
    expect(activeTableView).toBeTruthy();
    expect(activeTableView).toEqual(tableViewBtn);
  });

  it('Check the home screen contain user-cards', async () => {
    const userList = await page.$('#user-list');
    const liList = await userList.$$('li');
    expect(liList.length).toBeGreaterThan(0);
  });

  it('Checks the search functionality to display queried user', async () => {
    await page.type('input[id="user-search"]', 'randhir');
    await page.waitForNetworkIdle();
    const userList = await page.$('#user-list');
    const userCard = await userList.$$('li');
    expect(userCard.length).toBeGreaterThan(0);
  });

  it('Checks for empty string input once the user removes their input', async () => {
    // Find the user list and the user cards
    const userList = await page.$('#head_list');
    let userCard = await userList.$$('li');

    await page.click('input[id="user-search"]');
    await page.keyboard.down('Control'); // On Mac, use 'Meta' instead of 'Control'
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');

    await page.waitForNetworkIdle();

    userCard = await userList.$$('li');

    expect(userCard.length).toBeGreaterThan(0);
  });

  it('checks infinite scroll functionality to load more users', async () => {
    await page.goto('http://localhost:8000/users');
    await page.waitForNetworkIdle();
    const userList = await page.$('#user-list');
    let initialUserCount = await userList.$$eval('li', (items) => items.length);
    expect(initialUserCount).toBeGreaterThan(0);
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    const updatedUserCount = await userList.$$eval(
      'li',
      (items) => items.length,
    );
    expect(updatedUserCount).toBeGreaterThanOrEqual(initialUserCount);
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

  it('Selecting filters and clicking on apply should filter user list', async () => {
    await page.click('#filter-button');
    await page.click('input[value="ACTIVE"]');
    await page.click('#apply-filter-button');
    await page.waitForNetworkIdle();
    const userList = await page.$('#user-list');
    expect(userList).not.toBeNull();
    const userCard = await userList.$$('li');
    expect(userCard.length).toBeGreaterThanOrEqual(0);
  });

  it('clears the filter when the Clear button is clicked', async () => {
    const filterButton = await page.$('#filter-button');
    await filterButton.click();

    await page.waitForSelector('.filter-modal');

    const activeFilter = await page.$('input[value="ACTIVE"]');
    await activeFilter.click();

    const clearButton = await page.$('.filter-modal #clear-button');
    await clearButton.click();

    await page.waitForSelector('.filter-modal', { hidden: true });

    const currentState = await activeFilter.getProperty('checked');
    const isChecked = await currentState.jsonValue();
    expect(isChecked).toBe(false);
  });
});
