const puppeteer = require('puppeteer');

const {
  fetchedApplications,
  acceptedApplications,
  pendingApplications,
} = require('../../mock-data/applications');
const { superUserForAudiLogs } = require('../../mock-data/users');
const {
  STAGING_API_URL,
  LOCAL_TEST_PAGE_URL,
} = require('../../mock-data/constants');

describe('Toast Functionality', () => {
  let browser;
  let page;

  jest.setTimeout(60000);

  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
    });

    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (
        url === `${STAGING_API_URL}/applications?size=6` ||
        url ===
          `${STAGING_API_URL}/applications?next=YwTi6zFNI3GlDsZVjD8C&size=6`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            applications: fetchedApplications,
            next: '/applications?next=YwTi6zFNI3GlDsZVjD8C&size=6',
          }),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } else if (
        url === `${STAGING_API_URL}/applications?size=6&status=accepted`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ applications: acceptedApplications }),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } else if (url === `${STAGING_API_URL}/users?profile=true`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(superUserForAudiLogs),
        });
      } else if (
        url === `${STAGING_API_URL}/applications/lavEduxsb2C5Bl4s289P`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'application updated successfully!',
          }),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } else if (
        url ===
        `${STAGING_API_URL}/applications?size=6&status=accepted&dev=true`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            applications: acceptedApplications,
            totalCount: acceptedApplications.length,
          }),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } else if (
        url === `${STAGING_API_URL}/applications?size=6&status=pending&dev=true`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            applications: pendingApplications,
            totalCount: pendingApplications.length,
          }),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto(`${LOCAL_TEST_PAGE_URL}/applications`);
    await page.waitForNetworkIdle();
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Toast Functionality (Dev Mode Enabled)', () => {
    beforeEach(async () => {
      await page.goto(
        `${LOCAL_TEST_PAGE_URL}/applications?dev=true&status=pending`,
      );
      await page.waitForSelector('.application-card');
      await page.click('.application-card');

      await page.click('.application-details-accept');
      await page.waitForSelector('[data-testid="toast-component"].show');
    });

    it('should hide the toast automatically after 3 seconds', async function () {
      const toastComponent = await page.$('[data-testid="toast-component"]');
      await page.waitForTimeout(3500);

      expect(
        await toastComponent.evaluate((el) => el.classList.contains('show')),
      ).toBe(false);
      expect(
        await toastComponent.evaluate((el) => el.classList.contains('hide')),
      ).toBe(true);
    });

    it('should hide the toast when close button is clicked', async function () {
      const toastComponent = await page.$('[data-testid="toast-component"]');
      const closeButton = await page.$('[data-testid="toast-close-button"]');
      await closeButton.click();

      expect(
        await toastComponent.evaluate((el) => el.classList.contains('show')),
      ).toBe(false);
      expect(
        await toastComponent.evaluate((el) => el.classList.contains('hide')),
      ).toBe(true);
    });
  });
});
