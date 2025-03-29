const puppeteer = require('puppeteer');
const {
  STAGING_API_URL,
  LOCAL_TEST_PAGE_URL,
} = require('../../mock-data/constants');
const { userRandhir } = require('../../mock-data/users');

const mockFeedLogs = {
  message: 'All Logs fetched successfully',
  data: [
    {
      user: 'test-1',
      taskId: 'MxMSgBgaU3fZqZpx18Z2',
      taskTitle: 'test title',
      type: 'task',
      userId: '4Ij9wAlEZzEjvFX67OrN',
      username: 'test',
      subType: 'update',
      status: 'IN_PROGRESS',
      timestamp: 1743149176,
    },
  ],
  next: null,
  prev: null,
};

describe('Feed page Date Range Picker', () => {
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

      if (url.includes(`${STAGING_API_URL}/logs`)) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(mockFeedLogs),
        });
      } else if (url === `${STAGING_API_URL}/users?search=randhir&size=5`) {
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

    await page.goto(`${LOCAL_TEST_PAGE_URL}/feed`);
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Calendar UI', () => {
    it('should render date range input and calendar', async () => {
      const dateRangeInput = await page.$('[data-testid="date-range-input"]');
      const calendar = await page.$('[data-testid="calendar"]');

      expect(dateRangeInput).toBeTruthy();
      expect(calendar).toBeTruthy();
      expect(
        await calendar.evaluate((el) => el.classList.contains('hidden')),
      ).toBe(true);
    });

    it('should show calendar when clicking date range input', async () => {
      const dateRangeInput = await page.$('[data-testid="date-range-input"]');
      const calendar = await page.$('[data-testid="calendar"]');

      await dateRangeInput.click();
      await page.waitForTimeout(100);

      expect(
        await calendar.evaluate((el) => el.classList.contains('hidden')),
      ).toBe(false);
    });

    it('should hide calendar when clicking outside', async () => {
      const dateRangeInput = await page.$('[data-testid="date-range-input"]');
      const calendar = await page.$('[data-testid="calendar"]');

      await dateRangeInput.click();
      await page.waitForTimeout(100);

      await page.mouse.click(0, 0);
      await page.waitForTimeout(100);

      expect(
        await calendar.evaluate((el) => el.classList.contains('hidden')),
      ).toBe(true);
    });
  });

  describe('Calendar Navigation', () => {
    it('should display current month and year', async () => {
      const dateRangeInput = await page.$('[data-testid="date-range-input"]');
      const currentMonthText = await page.$('[data-testid="current-month"]');

      await dateRangeInput.click();
      await page.waitForTimeout(100);

      const monthText = await currentMonthText.evaluate((el) => el.textContent);
      const currentDate = new Date();
      const expectedMonthText = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      expect(monthText).toBe(expectedMonthText);
    });

    it('should navigate between months', async () => {
      const dateRangeInput = await page.$('[data-testid="date-range-input"]');
      const prevMonthBtn = await page.$('[data-testid="prev-month"]');
      const nextMonthBtn = await page.$('[data-testid="next-month"]');
      const currentMonthText = await page.$('[data-testid="current-month"]');

      await dateRangeInput.click();
      await page.waitForTimeout(100);

      const initialMonth = await currentMonthText.evaluate(
        (el) => el.textContent,
      );

      await nextMonthBtn.evaluate((el) => el.click());
      await page.waitForTimeout(100);
      const nextMonth = await currentMonthText.evaluate((el) => el.textContent);
      expect(nextMonth).not.toBe(initialMonth);

      await prevMonthBtn.evaluate((el) => el.click());
      await page.waitForTimeout(100);
      const prevMonth = await currentMonthText.evaluate((el) => el.textContent);
      expect(prevMonth).toBe(initialMonth);
    });
  });

  describe('Date Selection', () => {
    it('should select date range and update input value', async () => {
      const dateRangeInput = await page.$('[data-testid="date-range-input"]');
      const calendar = await page.$('[data-testid="calendar"]');

      await dateRangeInput.click();
      await page.waitForTimeout(100);

      await page.waitForFunction(
        () => {
          const days = document.querySelectorAll(
            '[data-testid="calendar-grid"] .calendar-day:not(.other-month)',
          );
          return days.length > 0;
        },
        { timeout: 5000 },
      );

      const calendarDays = await page.$$(
        '[data-testid="calendar-grid"] .calendar-day:not(.other-month)',
      );

      await calendarDays[0].evaluate((el) => el.click());
      await page.waitForTimeout(100);

      await calendarDays[1].evaluate((el) => el.click());
      await page.waitForTimeout(100);

      const inputValue = await dateRangeInput.evaluate((el) => el.value);
      expect(inputValue).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should highlight selected date range', async () => {
      const dateRangeInput = await page.$('[data-testid="date-range-input"]');
      const calendar = await page.$('[data-testid="calendar"]');

      await dateRangeInput.click();
      await page.waitForTimeout(100);

      await page.waitForFunction(
        () => {
          const days = document.querySelectorAll(
            '[data-testid="calendar-grid"] .calendar-day:not(.other-month)',
          );
          return days.length > 0;
        },
        { timeout: 5000 },
      );

      const calendarDays = await page.$$(
        '[data-testid="calendar-grid"] .calendar-day:not(.other-month)',
      );

      await calendarDays[0].evaluate((el) => el.click());
      await page.waitForTimeout(100);

      const startDateClass = await calendarDays[0].evaluate((el) =>
        el.classList.toString(),
      );
      expect(startDateClass).toContain('calendar-day');

      await calendarDays[1].evaluate((el) => el.click());
      await page.waitForTimeout(100);

      const endDateClass = await calendarDays[1].evaluate((el) =>
        el.classList.toString(),
      );
      expect(endDateClass).toContain('calendar-day');
    });
  });
});
