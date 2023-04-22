const puppeteer = require('puppeteer');
const {
  allUsersData,
  filteredUsersData,
} = require('../../mock-data/user-mock-data');

describe('Tests the User Management User Listing Screen', () => {
  let browser;
  let page;
  let userListElement;
  let tileViewBtn;
  let tableViewBtn;
  let userSearchElement;
  let paginationElement;
  let prevBtn;
  let nextBtn;
  jest.setTimeout(120000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      slowMo: 50,
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
    paginationElement = await page.$('#pagination');
    prevBtn = await page.$('#prevButton');
    nextBtn = await page.$('#nextButton');
  });

  afterAll(async () => {
    await browser.close();
  });

  it('Checks the UI elements on user listing page.', async () => {
    expect(userListElement).toBeTruthy();
    expect(tileViewBtn).toBeTruthy();
    expect(tableViewBtn).toBeTruthy();
    expect(userSearchElement).toBeTruthy();
    expect(paginationElement).toBeTruthy();
    expect(prevBtn).toBeTruthy();
    expect(nextBtn).toBeTruthy();
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

  it('checks the search functionality to display queried user', async () => {
    await page.type('input[id="user-search"]', 'randhir');
    await page.waitForNetworkIdle();
    await page.waitForFunction(() => {
      const userList = document.querySelector('#user-list');
      const userCard = userList.querySelectorAll('li');
      return userCard.length === 1;
    });
    const userList = await page.$('#user-list');
    const userCard = await userList.$$('li');
    expect(userCard.length).toBe(1);
  });

  it('checks the next and previous button functionality', async () => {
    await page.goto('http://localhost:8000/users');
    await page.waitForNetworkIdle();

    // Get the "next" button and check if it is disabled
    const nextBtn = await page.$('#nextButton');
    const isNextButtonDisabled = await page.evaluate(
      (button) => button.disabled,
      nextBtn,
    );
    expect(isNextButtonDisabled).toBe(false);

    // Click the "next" button and wait for the page to load
    await nextBtn.click();
    await page.waitForNetworkIdle();

    // Check that the "next" button is still present and the "previous" button is not disabled
    const updatedNextButton = await page.$('#nextButton');
    expect(updatedNextButton).toBeTruthy();

    const prevBtn = await page.$('#prevButton');
    const isPrevButtonDisabled = await page.evaluate(
      (button) => button.disabled,
      prevBtn,
    );
    expect(isPrevButtonDisabled).toBe(false);
  });

  it('Clicking on filter button should display filter modal', async () => {
    await page.click('#filter-button');
    const modal = await page.$('.filter-modal');
    expect(modal).not.toBeNull();
    await page.click('#filter-button');
  });

  it('Selecting filters and clicking on apply should filter user list', async () => {
    await page.click('#filter-button');
    await page.click('input[value="ACTIVE"]');
    await page.click('#apply-filter-button');
    await page.waitForNetworkIdle();
    const userList = await page.$('#user-list');
    expect(userList).not.toBeNull();
    const userCard = await userList.$$('li');
    expect(userCard.length).toBeGreaterThan(0);
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
