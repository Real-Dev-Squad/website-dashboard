const puppeteer = require('puppeteer');
const { user } = require('../../mock-data/users');
const { standup } = require('../../mock-data/standup');
const {
  STAGING_API_URL,
  LOCAL_TEST_PAGE_URL,
} = require('../../mock-data/constants');

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

function countSundays(startDate, endDate) {
  let start = new Date(startDate);
  let end = new Date(endDate);

  let sundayCount = 0;
  while (start.getDay() !== 0) {
    start.setDate(start.getDate() + 1);
  }

  while (start <= end) {
    sundayCount++;
    start.setDate(start.getDate() + 7);
  }

  return sundayCount;
}

function calculateScrollPosition(date, width) {
  const selectedDate = new Date(date);
  const endDate = new Date();
  selectedDate.setHours(0, 0, 0, 0);

  const dateDifference = endDate.getTime() - selectedDate.getTime();
  const numberOfSundays = countSundays(selectedDate, endDate);
  const oneDay = 24 * 60 * 60 * 1000;
  const days = Math.floor(dateDifference / oneDay) - numberOfSundays;
  return days * width;
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

      if (url === `${STAGING_API_URL}/users/sunny`) {
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
        url === `${STAGING_API_URL}/progresses?userId=YleviOe1SsOML8eitV9W`
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
    await page.goto(`${LOCAL_TEST_PAGE_URL}/standup`);
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

  it('should scroll to the correct date column when a date is selected', async () => {
    const dateInput = await page.$('#date');
    const testDate = '2024-09-25';

    await page.evaluate(() => {
      const datePicker = document.getElementById('date');
      datePicker.value = '2024-09-25';
      const event = new Event('change');
      datePicker.dispatchEvent(event);
    });

    await page.waitForTimeout(1000);

    let scrollPosition = await page.evaluate(() => {
      return document.getElementById('table-container').scrollLeft;
    });

    const width = await page.evaluate(() => {
      return document.getElementsByClassName('dates')[0].offsetWidth;
    });

    scrollPosition = Math.ceil(scrollPosition);

    const expectedScrollPosition = calculateScrollPosition(testDate, width);

    expect(scrollPosition).toEqual(expectedScrollPosition);

    await page.evaluate(() => {
      const datePicker = document.getElementById('date');
      datePicker.value = new Date().toLocaleDateString('en-CA');
      const event = new Event('change');
      datePicker.dispatchEvent(event);
    });
  });

  it('shouldnot scroll if the date selected is not in range', async () => {
    const dateInput = await page.$('#date');
    const testDate = '2025-09-26';

    await page.evaluate(() => {
      const datePicker = document.getElementById('date');
      datePicker.value = '2025-09-26';
      const event = new Event('change');
      datePicker.dispatchEvent(event);
    });

    await page.waitForTimeout(1000);

    let scrollPosition = await page.evaluate(() => {
      return document.getElementById('table-container').scrollLeft;
    });

    const width = await page.evaluate(() => {
      return document.getElementsByClassName('dates')[0].offsetWidth;
    });

    scrollPosition = Math.ceil(scrollPosition);

    const expectedScrollPosition = calculateScrollPosition(testDate, width);

    expect(scrollPosition).toEqual(0);

    await page.evaluate(() => {
      const datePicker = document.getElementById('date');
      datePicker.value = new Date().toLocaleDateString('en-CA');
      const event = new Event('change');
      datePicker.dispatchEvent(event);
    });
  });
});
