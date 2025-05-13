const puppeteer = require('puppeteer');
const {
  STAGING_API_URL,
  LOCAL_TEST_PAGE_URL,
} = require('../../mock-data/constants');
const { pendingProfileDiff } = require('../../mock-data/profile-diff-details');
const { superUserData, userRandhir } = require('../../mock-data/users');

describe('Toast Functionality (Dev Mode Enabled)', () => {
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

      if (url === `${STAGING_API_URL}/users?profile=true`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',

          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(superUserData),
        });
      } else if (
        url === `${STAGING_API_URL}/profileDiffs/n1AzYaVnVBshyIbkhsVG`
      ) {
        interceptedRequest.respond({
          status: 201,
          contentType: 'application/json',

          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },

          body: JSON.stringify(pendingProfileDiff),
        });
      } else if (url === `${STAGING_API_URL}/users?id=7yzVDl8s1ORNCtH9Ps7K`) {
        interceptedRequest.respond({
          status: 201,
          contentType: 'application/json',

          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },

          body: JSON.stringify({ userRandhir }),
        });
      } else if (url === `${STAGING_API_URL}/users/7yzVDl8s1ORNCtH9Ps7K`) {
        interceptedRequest.respond({
          status: 400,
          contentType: 'application/json',

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
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/profile-diff-details/?id=n1AzYaVnVBshyIbkhsVG&dev=true`,
    );
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should show error toast when failed to approve', async function () {
    const approveButton = await page.$('.button__approve');
    approveButton.click();
    await page.waitForNetworkIdle();
    const toastComponent = await page.$('[data-testid="toast-component"]');
    expect(
      await toastComponent.evaluate((el) => el.classList.contains('show')),
    ).toBe(true);
    expect(
      await toastComponent.evaluate((el) => el.classList.contains('hide')),
    ).toBe(false);
    expect(
      await toastComponent.evaluate((el) =>
        el.classList.contains('success__toast'),
      ),
    ).toBe(false);
    expect(
      await toastComponent.evaluate((el) =>
        el.classList.contains('error__toast'),
      ),
    ).toBe(true);
    const toastMessage = await page.$('[data-testid="toast-message"]');
    expect(await toastMessage.evaluate((el) => el.textContent)).toBe(
      'Something went wrong!',
    );
  });
});
