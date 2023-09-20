const puppeteer = require('puppeteer');

const { fetchedTaskRequests } = require('../../mock-data/taskRequests');

const SITE_URL = 'http://localhost:8000';
// helper/loadEnv.js file causes API_BASE_URL to be stagin-api on local env url in taskRequest/index.html
const API_BASE_URL = 'https://staging-api.realdevsquad.com';

describe('Task Requests', () => {
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

    page.on('request', (request) => {
      if (request.url() === `${API_BASE_URL}/taskRequests`) {
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
      } else {
        request.continue();
      }
    });

    await page.goto(`${SITE_URL}/taskRequests`);
    await page.waitForNetworkIdle();
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
