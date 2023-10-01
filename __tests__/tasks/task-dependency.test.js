const API_BASE_URL = 'https://api.realdevsquad.com';
const puppeteer = require('puppeteer');
const { tags } = require('../../mock-data/tags');
const { levels } = require('../../mock-data/levels');
const { users } = require('../../mock-data/users');
describe('Input box', () => {
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
      } else if (url === `${API_BASE_URL}/members`) {
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
    await page.goto('http://localhost:8000/task');
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });
  it('DependsOn input box should exist', async () => {
    const inputBox = await page.evaluate(() =>
      document.querySelector('.inputBox'),
    );
    const linksDisplay = await page.evaluate(() =>
      document.querySelector('#linksDisplay'),
    );
  });

  it('DependsOn input should have correct attributes', async () => {
    const input = await page.$('#dependsOn');
    const type = await input.evaluate((el) => el.getAttribute('type'));
    const name = await input.evaluate((el) => el.getAttribute('name'));
    const id = await input.evaluate((el) => el.getAttribute('id'));
    const placeholder = await input.evaluate((el) =>
      el.getAttribute('placeholder'),
    );
    const classList = await input.evaluate((el) => Array.from(el.classList));

    expect(type).toBe('text');
    expect(name).toBe('dependsOn');
    expect(id).toBe('dependsOn');
    expect(placeholder).toBe('Task ID separated with comma ');
    expect(classList.includes('notEditing')).toBeTruthy();
  });
});
