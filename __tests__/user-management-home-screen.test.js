const puppeteer = require('puppeteer');

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
  jest.setTimeout(60000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      // slowMo: 50,
    });
    page = await browser.newPage();
    const cookieValue =
      'rds-session=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJEdFI5c0s3Q3lzT1ZIUDE3emw4TiIsImlhdCI6MTY3MzkxNzE0OCwiZXhwIjoxNjc2NTA5MTQ4fQ.fO-Tz-6HR5QMgfWLYN6Tp54Fpc2FgpF_YWywhXLN-g1uoWAxj8M2X59eGHImQPoL-4i7fE5yN28nzolkIphp7iz3qRKcJ4IOy9dBXBQSNo-QBbXDgqjJQ1evxP-qmW7I6AX5YJ1Uv0k11UC4eTsVgAxJjGqGh1DB5IIH1mVDnO22VoUicjr8T5nFFQCvlLJIllF8O5BqlMZeVKvkqrKgxt5Jm5Bdj9Sd94uGqOXz5WlX_KKhXXAER4MPnNyqHa5XuQDP0Cf2USChLKssTbuFoy7pppw3QUyIm6FCrdCTMa6KwBgNuyGnTfmNePfNdJWTEy-K13nKPITx7zUbmPhx7A';
    await page.setExtraHTTPHeaders({
      'content-Type': 'application/json',
      Cookie: cookieValue,
    });
    await page.goto('https://dev.realdevsquad.com/users');
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
    const userCards = await userList.$$('.user-card');
    expect(userCards.length).toBeGreaterThan(0);
  });

  it('checks the search functionality to display queried user', async () => {
    await page.type('input[id="user-search"]', 'randhir');
    await page.waitForNetworkIdle();
    await page.waitForFunction(() => {
      const userList = document.querySelector('#user-list');
      const userCard = userList.querySelectorAll('.user-card');
      return userCard.length === 1;
    });
    const userList = await page.$('#user-list');
    const userCard = await userList.$$('.user-card');
    expect(userCard.length).toBe(1);
  });

  it('checks the next and previous button functionality', async () => {
    // Check if the "next" button is disabled
    const isNextButtonDisabled = await page.evaluate(
      (button) => button.disabled,
      nextBtn,
    );
    expect(isNextButtonDisabled).toBe(false);
    await nextBtn.click();

    // await page.waitFor(1000);
    await page.waitForNetworkIdle();
    await page.waitForTimeout(1000);

    const updatedNextButton = await page.$('#nextButton');
    expect(updatedNextButton).toBeTruthy();
    const isPrevButtonDisabled = await page.evaluate(
      (button) => button.disabled,
      prevBtn,
    );
    expect(isPrevButtonDisabled).toBe(false);
  });
});
