const API_BASE_URL = 'https://api.realdevsquad.com';
const puppeteer = require('puppeteer');
const { tags } = require('../../mock-data/tags');
const { levels } = require('../../mock-data/levels');
const { users } = require('../../mock-data/users');

describe('Dev Feature Flag Tests', () => {
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
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setRequestInterception(true);

    // Mock API responses
    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();

      if (url === `${API_BASE_URL}/levels`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(levels),
        });
      } else if (url === `${API_BASE_URL}/users`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(users),
        });
      } else if (url === `${API_BASE_URL}/tags`) {
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
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('With dev=true', () => {
    beforeEach(async () => {
      await page.goto('http://localhost:8000/task?dev=true');
      await page.waitForNetworkIdle();
    });

    it('should hide feature URL field', async () => {
      const featureUrlField = await page.$eval(
        '#featureUrl',
        (el) => window.getComputedStyle(el.closest('.inputBox')).display,
      );
      expect(featureUrlField).toBe('none');
    });

    it('should hide feature/group radio buttons', async () => {
      const featureRadio = await page.$eval(
        '.feature',
        (el) => window.getComputedStyle(el.closest('.inputBox')).display,
      );
      expect(featureRadio).toBe('none');
    });

    it('should hide task level field', async () => {
      const taskLevelDiv = await page.$eval(
        'label[for="taskLevel"]',
        (el) => window.getComputedStyle(el.closest('.inputBox')).display,
      );
      expect(taskLevelDiv).toBe('none');
    });
  });

  describe('With dev=false (default)', () => {
    beforeEach(async () => {
      await page.goto('http://localhost:8000/task');
      await page.waitForNetworkIdle();
    });

    it('should show feature URL field', async () => {
      const featureUrlField = await page.$eval(
        '#featureUrl',
        (el) => window.getComputedStyle(el.closest('.inputBox')).display,
      );
      expect(featureUrlField).not.toBe('none');
    });

    it('should show feature/group radio buttons', async () => {
      const featureRadio = await page.$eval(
        '.feature',
        (el) => window.getComputedStyle(el.closest('.inputBox')).display,
      );
      expect(featureRadio).not.toBe('none');
    });

    it('should show task level field', async () => {
      const taskLevelDiv = await page.$eval(
        'label[for="taskLevel"]',
        (el) => window.getComputedStyle(el.closest('.inputBox')).display,
      );
      expect(taskLevelDiv).not.toBe('none');
    });
  });
});
