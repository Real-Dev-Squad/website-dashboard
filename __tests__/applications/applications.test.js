const puppeteer = require('puppeteer');

const {
  fetchedApplications,
  acceptedApplications,
} = require('../../mock-data/applications');
const { superUserForAudiLogs } = require('../../mock-data/users');

const SITE_URL = 'http://localhost:8000';
// helper/loadEnv.js file causes API_BASE_URL to be stagin-api on local env url in taskRequest/index.html
const API_BASE_URL = 'https://staging-api.realdevsquad.com';

describe('Applications page', () => {
  let browser;
  let page;

  jest.setTimeout(60000);

  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
    });
  });
  beforeEach(async () => {
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (request) => {
      if (
        request.url() === `${API_BASE_URL}/applications?size=6` ||
        request.url() ===
          `${API_BASE_URL}/applications?next=YwTi6zFNI3GlDsZVjD8C&size=6`
      ) {
        request.respond({
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
        request.url() === `${API_BASE_URL}/applications?size=6&status=accepted`
      ) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ applications: acceptedApplications }),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } else if (request.url() === `${API_BASE_URL}/users/self`) {
        request.respond({
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
        request.url() === `${API_BASE_URL}/applications/lavEduxsb2C6Bl4s289P`
      ) {
        request.respond({
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
        request.url() ===
        `${API_BASE_URL}/applications?size=6&status=accepted&dev=true`
      ) {
        request.respond({
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
      } else {
        request.continue();
      }
    });
    await page.goto(`${SITE_URL}/applications`);
    await page.waitForNetworkIdle();
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should render the initial UI elements', async function () {
    const title = await page.$('.header h1');
    const filterButton = await page.$('.filter-button');
    const applicationCards = await page.$$('.application-card');
    expect(title).toBeTruthy();
    expect(filterButton).toBeTruthy();
    expect(applicationCards).toBeTruthy();
    expect(applicationCards.length).toBe(6);
  });

  it('should render the initial UI elements under dev flag === true', async function () {
    await page.goto(`${SITE_URL}/applications?dev=true`);
    const title = await page.$('.header h1');
    const filterButton = await page.$('.filter-button');
    const applicationCards = await page.$$('.application-card');
    expect(title).toBeTruthy();
    expect(filterButton).toBeTruthy();
    expect(applicationCards).toBeTruthy();
    expect(applicationCards.length).toBe(6);
    for (const card of applicationCards) {
      const viewDetailsButton = await card.$('.view-details-button');
      expect(viewDetailsButton).toBeFalsy();
    }
  });

  it('should load and render the accepted application requests when accept is selected from filter, and after clearing the filter it should again show all the applications', async function () {
    await page.click('.filter-button');

    await page.$eval('input[name="status"][value="accepted"]', (radio) =>
      radio.click(),
    );
    await page.click('.apply-filter-button');
    await page.waitForNetworkIdle();
    let applicationCards = await page.$$('.application-card');
    expect(applicationCards.length).toBe(4);

    await page.click('.filter-button');
    await page.click('.clear-btn');

    await page.waitForNetworkIdle();
    applicationCards = await page.$$('.application-card');
    expect(applicationCards.length).toBe(6);
    const urlAfterClearingStatusFilter = new URL(page.url());
    expect(
      urlAfterClearingStatusFilter.searchParams.get('status') === null,
    ).toBe(true, 'status query param is not removed from url');
  });

  it('should load and render the accepted application requests when accept filter is selected from filter under dev flag === true along with the total count of the accepted applications', async function () {
    await page.goto(`${SITE_URL}/applications?dev=true`);
    await page.click('.filter-button');

    await page.$eval('input[name="status"][value="accepted"]', (radio) =>
      radio.click(),
    );
    await page.click('.apply-filter-button');
    await page.waitForNetworkIdle();
    const totalCountElement = await page.$$('total_count');
    expect(totalCountElement).toBeTruthy(); // Assert that the element exists
  });
  it('should load more applications on going to the bottom of the page', async function () {
    let applicationCards = await page.$$('.application-card');
    expect(applicationCards.length).toBe(6);
    await page.evaluate(() => {
      const element = document.querySelector('#page_bottom_element');
      if (element) {
        element.scrollIntoView({ behavior: 'auto' });
      }
    });
    await page.waitForNetworkIdle();
    applicationCards = await page.$$('.application-card');
    expect(applicationCards.length).toBe(12);
  });

  it('should open application details modal for application, when user click on view details on any card', async function () {
    const applicationDetailsModal = await page.$('.application-details');
    expect(
      await applicationDetailsModal.evaluate((el) =>
        el.classList.contains('hidden'),
      ),
    ).toBe(true);
    await page.click('.view-details-button');
    expect(
      await applicationDetailsModal.evaluate((el) =>
        el.classList.contains('hidden'),
      ),
    ).toBe(false);
    const urlAfterOpeningModal = new URL(page.url());
    expect(urlAfterOpeningModal.searchParams.get('id') !== null).toBe(true);
  });

  it('under feature flag should open application details modal for application, when user click on card', async function () {
    await page.goto(`${SITE_URL}/applications/?dev=true`);
    await page.waitForNetworkIdle();
    const applicationDetailsModal = await page.$('.application-details');
    expect(
      await applicationDetailsModal.evaluate((el) =>
        el.classList.contains('hidden'),
      ),
    ).toBe(true);
    await page.click('.application-details');
    expect(
      await applicationDetailsModal.evaluate((el) =>
        el.classList.contains('hidden'),
      ),
    ).toBe(false);
    const urlAfterOpeningModal = new URL(page.url());
    expect(urlAfterOpeningModal.searchParams.get('id') !== null).toBe(true);
  });

  it('should close application details modal, when user clicks the close button', async function () {
    const applicationDetailsModal = await page.$('.application-details');
    await page.click('.view-details-button');
    await applicationDetailsModal.$eval('.application-close-button', (node) =>
      node.click(),
    );
    expect(
      await applicationDetailsModal.evaluate((el) =>
        el.classList.contains('hidden'),
      ),
    ).toBe(true);
    const urlAfterClosingModal = new URL(page.url());
    expect(urlAfterClosingModal.searchParams.get('id') === null).toBe(
      true,
      'id query param is not removed from url',
    );
  });

  it('should load all applications behind the modal on applications/?id= page load', async function () {
    await page.click('.view-details-button');
    await page.reload();
    await page.waitForNetworkIdle();
    const applicationDetailsModal = await page.$('.application-details');
    await applicationDetailsModal.$eval('.application-close-button', (node) =>
      node.click(),
    );
    const applicationCards = await page.$$('.application-card');
    expect(applicationCards).toBeTruthy();
    expect(applicationCards.length).toBe(6);
  });

  it.skip('should show toast message with application updated successfully', async function () {
    await page.click('.view-details-button');
    await page.click('.application-details-accept');
    const toast = await page.$('#toast');
    expect(await toast.evaluate((el) => el.classList.contains('hidden'))).toBe(
      false,
    );
    expect(await toast.evaluate((el) => el.innerText)).toBe(
      'application updated successfully!',
    );
    await page.waitForNetworkIdle();
  });

  it('should display the footer with the correct repo link', async () => {
    const footer = await page.$('footer');
    expect(footer).toBeTruthy();

    const infoRepo = await footer.$('.info-repo');
    expect(infoRepo).toBeTruthy();

    const repoLink = await infoRepo.$('a');
    expect(repoLink).toBeTruthy();

    const repoLinkHref = await page.evaluate((el) => el.href, repoLink);
    expect(repoLinkHref).toBe(
      'https://github.com/Real-Dev-Squad/website-dashboard',
    );

    const repoLinkTarget = await page.evaluate((el) => el.target, repoLink);
    expect(repoLinkTarget).toBe('_blank');

    const repoLinkRel = await page.evaluate((el) => el.rel, repoLink);
    expect(repoLinkRel).toBe('noopener noreferrer');

    const repoLinkText = await page.evaluate((el) => el.innerText, repoLink);
    expect(repoLinkText).toBe('open sourced repo');

    const repoLinkClass = await page.evaluate((el) => el.className, repoLink);
    expect(repoLinkClass).toBe('');

    const repoLinkStyle = await page.evaluate((el) => el.style, repoLink);
    expect(repoLinkStyle).toBeTruthy();
  });
});
