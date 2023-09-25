const puppeteer = require('puppeteer');
const API_BASE_URL = 'https://staging-api.realdevsquad.com';
const { user } = require('../../mock-data/users');
const { standup } = require('../../mock-data/standup');

const oneDay = 24 * 60 * 60 * 1000;
const numberOfMonthsAgo = 3;
const currentDateObj = new Date();
const currentYearNum = currentDateObj.getFullYear();
const currentMonthNum = currentDateObj.getMonth();
const endDate = currentDateObj;
const startDate = new Date(
  currentYearNum,
  currentMonthNum - numberOfMonthsAgo,
  1,
);

function isSunday(date) {
  return date.getDay() === 0;
}

function generateExpectedDateValues() {
  const expectedDateValues = [];
  for (
    let date = new Date(endDate);
    date >= startDate;
    date = new Date(date.getTime() - oneDay)
  ) {
    if (!isSunday(date)) {
      expectedDateValues.push(date);
    }
  }
  return expectedDateValues;
}

describe('Standup Page', () => {
  let browser;
  let page;
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

      if (url === `${API_BASE_URL}/users/sunny`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',

          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(user),
        });
      } else if (
        url === `${API_BASE_URL}/progresses?userId=YleviOe1SsOML8eitV9W`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(standup),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto('http://localhost:8000/standup');
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should display the table when the search button is clicked', async () => {
    const userInput = await page.$('#user-search-input');
    const searchButton = await page.$('#search-button');

    await userInput.type('sunny');
    await searchButton.click();
    await page.waitForSelector('#table-container');
    const table = await page.$('.user-standup-table');
    expect(table).toBeTruthy();
  });

  it('should display the loader when the search button is clicked', async () => {
    const userInput = await page.$('#user-search-input');
    const searchButton = await page.$('#search-button');

    await userInput.type('sunny');
    await searchButton.click();
    await page.waitForSelector('#table-container');
    const loader = await page.$('.loader');
    expect(loader).toBeTruthy();
  });

  it('should update the URL with the query parameter when the user writes a name', async () => {
    const userInput = await page.$('#user-search-input');
    const searchButton = await page.$('#search-button');
    await userInput.click({ clickCount: 3 });
    await userInput.press('Backspace');
    await userInput.type('sunny');
    await searchButton.click();
    await page.waitForTimeout(1000);
    const updatedUrl = page.url();
    expect(updatedUrl).toContain('q=user:sunny');
  });

  it('should update the URL with the query parameter when the user writes multiple names', async () => {
    const userInput = await page.$('#user-search-input');
    const searchButton = await page.$('#search-button');
    await userInput.click({ clickCount: 3 });
    await userInput.press('Backspace');
    await userInput.type('sunny,pratiyush');
    await searchButton.click();
    await page.waitForTimeout(1000);
    const updatedUrl = page.url();
    expect(updatedUrl).toContain('q=user:sunny+user:pratiyush');
  });

  it('should update the URL with the query parameter when the user writes duplicate names', async () => {
    const userInput = await page.$('#user-search-input');
    const searchButton = await page.$('#search-button');
    await userInput.click({ clickCount: 3 });
    await userInput.press('Backspace');
    await userInput.type('sunny,sunny,pratiyush');
    await searchButton.click();
    await page.waitForTimeout(1000);
    const updatedUrl = page.url();
    expect(updatedUrl).toContain('q=user:sunny+user:pratiyush');
  });

  it('should display the correct date range in the table header', async () => {
    const dateCellValues = await page.evaluate(() => {
      const dateCells = Array.from(document.querySelectorAll('.dates'));
      return dateCells.map((cell) => cell.textContent.trim());
    });
    const expectedDateValues = generateExpectedDateValues();
    expect(dateCellValues.length).toEqual(expectedDateValues.length);
  });
});
