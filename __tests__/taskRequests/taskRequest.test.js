const puppeteer = require('puppeteer');

const { fetchedTaskRequests } = require('../../mock-data/taskRequests');

const SITE_URL = 'http://localhost:8000';
// helper/loadEnv.js file causes API_BASE_URL to be stagin-api on local env url in taskRequest/index.html
const API_BASE_URL = 'https://staging-api.realdevsquad.com';

describe('Task Requests', () => {
  let browser;
  let page;

  jest.setTimeout(60000);

  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
      devtools: false,
    });
  });
  beforeEach(async () => {
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (request) => {
      if (
        request.url() === `${API_BASE_URL}/taskRequests` ||
        request.url() === `${API_BASE_URL}/taskRequests?dev=true` ||
        request.url() ===
          `${API_BASE_URL}/taskRequests?size=20&q=status%3Apending+sort%3Acreated-asc&dev=true`
      ) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: fetchedTaskRequests }),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } else if (
        request.url() ===
        `${API_BASE_URL}/taskRequests?size=20&q=status%3Aapproved++sort%3Acreated-asc&dev=true`
      ) {
        const list = [];
        for (let i = 0; i < 20; i++) {
          list.push(fetchedTaskRequests[0]);
        }
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: list,
            next: '/taskRequests?size=20&q=status%3Aapproved++sort%3Acreated-asc&dev=true',
          }),
        });
      } else {
        request.continue();
      }
    });
    await page.goto(`${SITE_URL}/taskRequests`);
    await page.waitForNetworkIdle();
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });
  describe('When the user is super user', () => {
    it('should display the task requests card', async () => {
      const url = await page.evaluate(() => API_BASE_URL);
      const taskCards = await page.$$('.taskRequest__card');
      const title = await taskCards[0].evaluate(
        (el) => el.children[0].textContent,
      );
      const purpose = await taskCards[0].evaluate(
        (el) => el.children[1].textContent,
      );

      expect(taskCards).toHaveLength(1);
      expect(title).toMatch(/test title/i);
      expect(purpose).toMatch(/test purpose/i);
    });
    describe('Filter Modal', () => {
      it('should be hidden initially', async () => {
        const modal = await page.$('.filter-modal');
        expect(
          await modal.evaluate((el) => el.classList.contains('hidden')),
        ).toBe(true);
      });

      it('should be displayed after clicking the filter button and hidden on outside click', async () => {
        const modal = await page.$('.filter-modal');
        const filterHead = await page.$('.filter-head');
        const filterContainer = await page.$('.filters-container');
        expect(filterHead).toBeTruthy();
        expect(filterContainer).toBeTruthy();
        await page.click('#filter-button');
        expect(modal).not.toBeNull();
        expect(
          await modal.evaluate((el) => el.classList.contains('hidden')),
        ).toBe(false);
        await page.mouse.click(200, 200);
        expect(
          await modal.evaluate((el) => el.classList.contains('hidden')),
        ).toBe(true);
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

      it('Selecting filters and clicking on apply should filter task request list', async () => {
        let cardsList = await page.$$('.taskRequest__card');
        expect(cardsList).not.toBeNull();
        const initialLength = cardsList.length;
        await page.click('#filter-button');
        await page.click('input[value="PENDING"]');
        await page.click('input[value="APPROVED"]');
        await page.click('#apply-filter-button');
        await page.waitForNetworkIdle();
        cardsList = await page.$$('.taskRequest__card');
        expect(cardsList).not.toBeNull();
        expect(cardsList.length).toBeGreaterThanOrEqual(0);
        expect(cardsList.length).not.toBe(initialLength);
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

    describe('Sort Modal', () => {
      it('should be hidden initially', async () => {
        const sortModal = await page.$('.sort-modal');
        const assigneButton = await page.$('#REQUESTORS_COUNT_ASC');
        expect(
          await sortModal.evaluate((el) => el.classList.contains('hidden')),
        ).toBe(true);
        expect(assigneButton).toBeTruthy();
      });

      it('should toggle visibility sort modal by clicking the sort button and selecting an option', async () => {
        const sortModal = await page.$('.sort-modal');
        const assigneButton = await page.$('#REQUESTORS_COUNT_ASC');
        const sortHead = await page.$('.sort-head');
        const sortContainer = await page.$('.sorts-container');

        expect(sortHead).toBeTruthy();
        expect(sortContainer).toBeTruthy();

        await page.click('.sort-button');
        await page.click('#REQUESTORS_COUNT_ASC');
        expect(
          await assigneButton.evaluate((el) =>
            el.classList.contains('selected'),
          ),
        ).toBe(true);
        expect(
          await sortModal.evaluate((el) => el.classList.contains('hidden')),
        ).toBe(true);
        await page.click('.sort-button');
        await page.click('#REQUESTORS_COUNT_ASC');
        expect(
          await assigneButton.evaluate((el) =>
            el.classList.contains('selected'),
          ),
        ).toBe(false);
        expect(
          await sortModal.evaluate((el) => el.classList.contains('hidden')),
        ).toBe(true);
      });
    });

    it('Checks that new items are loaded when scrolled to the bottom', async () => {
      await page.click('#filter-button');
      await page.click('input[value="PENDING"]');
      await page.click('input[value="APPROVED"]');
      await page.click('#apply-filter-button');
      await page.waitForNetworkIdle();
      let taskRequestList = await page.$$('.taskRequest__card');
      expect(taskRequestList.length).toBe(20);
      await page.evaluate(() => {
        const element = document.querySelector('.virtual');
        if (element) {
          element.scrollIntoView({ behavior: 'auto' });
        }
      });
      await page.waitForNetworkIdle();
      taskRequestList = await page.$$('.taskRequest__card');
      expect(taskRequestList.length).toBe(40);
    });
  });
});

describe('createCustomElement', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
    });

    page = await browser.newPage();

    await page.goto(`${SITE_URL}/taskRequests`);
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('tagName', () => {
    it('should create tag with provided tagName', async () => {
      const tag = await page.evaluate(
        () => createCustomElement({ tagName: 'p' }).tagName,
      );
      expect(tag).toMatch(/p/i);
    });

    it('should not add tagName attribute', async () => {
      const tagNameAttr = await page.evaluate(() =>
        createCustomElement({ tagName: 'p' }).getAttribute('tagName'),
      );

      expect(tagNameAttr).toBeNull();
    });
  });

  describe('className', () => {
    it('should add the class when class key is provided using string', async () => {
      const classes = await page.evaluate(() => [
        ...createCustomElement({ tagName: 'p', class: 'test-class' }).classList,
      ]);

      expect(classes).toHaveLength(1);
      expect(classes).toContain('test-class');
    });

    it('should add multiple classes when class key has array as value', async () => {
      const classes = await page.evaluate(() => [
        ...createCustomElement({
          tagName: 'p',
          class: ['test-class-1', 'test-class-2'],
        }).classList,
      ]);

      expect(classes).toHaveLength(2);
      expect(classes).toStrictEqual(['test-class-1', 'test-class-2']);
    });
  });

  describe('textContent', () => {
    it('should add textContent key when specified', async () => {
      const textContent = await page.evaluate(
        () =>
          createCustomElement({ tagName: 'p', textContent: 'test content' })
            .textContent,
      );

      expect(textContent).toBe('test content');
    });
  });
});
