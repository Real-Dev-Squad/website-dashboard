const API_BASE_URL = 'https://api.realdevsquad.com';
const puppeteer = require('puppeteer');
const { users } = require('../../mock-data/users');

describe('Task Form - Dev Mode', () => {
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

    // Setup request interception
    await page.setRequestInterception(true);
    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();

      if (url === `${API_BASE_URL}/users`) {
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
      } else {
        interceptedRequest.continue();
      }
    });

    await page.goto('http://localhost:8000/task?dev=true');
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Hidden Fields', () => {
    it('should hide feature URL field', async () => {
      const featureUrlField = await page.$('#featureUrl');
      const isHidden = await featureUrlField.evaluate(
        (el) =>
          window.getComputedStyle(el.closest('.inputBox')).display === 'none',
      );
      expect(isHidden).toBe(true);
    });

    it('should hide feature radio options', async () => {
      const featureRadio = await page.$('#feature');
      const isHidden = await featureRadio.evaluate(
        (el) =>
          window.getComputedStyle(el.closest('.inputBox')).display === 'none',
      );
      expect(isHidden).toBe(true);
    });

    it('should hide task level field', async () => {
      const taskLevelField = await page.$('[for="taskLevel"]');
      const isHidden = await taskLevelField.evaluate(
        (el) =>
          window.getComputedStyle(el.closest('.inputBox')).display === 'none',
      );
      expect(isHidden).toBe(true);
    });
  });

  describe('API Calls', () => {
    it('should not make API calls for tags and levels', async () => {
      const apiCalls = [];
      page.on('request', (request) => {
        apiCalls.push(request.url());
      });

      await page.reload();
      await page.waitForNetworkIdle();

      expect(apiCalls).not.toContain(`${API_BASE_URL}/tags`);
      expect(apiCalls).not.toContain(`${API_BASE_URL}/levels`);
    });

    it('should not make API calls for suggested users when category changes', async () => {
      const apiCalls = [];
      page.on('request', (request) => {
        apiCalls.push(request.url());
      });

      await page.select('#category', '1');
      await page.waitForNetworkIdle();

      const suggestedUsersCall = apiCalls.find((url) =>
        url.includes(`${API_BASE_URL}/users/suggestedUsers`),
      );
      expect(suggestedUsersCall).toBeUndefined();
    });
  });
});
