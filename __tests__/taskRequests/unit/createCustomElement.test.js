const puppeteer = require('puppeteer');
const { createCustomElement } = require('../../../taskRequests/util');

describe('createCustomElement', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
      devtools: false,
    });
    page = await browser.newPage();

    await page.goto('http://localhost:8000/taskRequests');
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
