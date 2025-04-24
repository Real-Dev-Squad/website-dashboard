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

  it('should render the initial UI elements', async function () {
    const title = await page.$('.header h1');
    const filterButton = await page.$('.filter-button');
    const applicationCards = await page.$$('.application-card');
    expect(title).toBeTruthy();
    expect(filterButton).toBeTruthy();
    expect(applicationCards).toBeTruthy();
    expect(applicationCards.length).toBe(6);
  });

  it('should render the index of pending applications under dev flag === true', async function () {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/applications?dev=true&status=pending`,
    );
    const indexOfApplication = await page.$$('[data-testid="user-index"]');
    expect(indexOfApplication).toBeTruthy();
  });

  it('should render the initial UI elements under dev flag === true', async function () {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/applications?dev=true`);
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
    await page.goto(`${LOCAL_TEST_PAGE_URL}/applications?dev=true`);
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
    await page.goto(`${LOCAL_TEST_PAGE_URL}/applications/?dev=true`);
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
    const footer = await page.$('[data-test-id="footer"]');
    expect(footer).toBeTruthy();

    const infoRepo = await footer.$('[data-test-id="info-repo"]');
    expect(infoRepo).toBeTruthy();

    const repoLink = await infoRepo.$('[data-test-id="repo-link"]');
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

  it.skip('should show success toast after accepting an application', async function () {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/applications?dev=true&status=pending`,
    );
    await page.waitForSelector('.application-card');
    await page.click('.application-card');

    await page.click('.application-details-accept');
    await page.waitForSelector('[data-testid="toast-component"].show');
    const toastComponent = await page.$('[data-testid="toast-component"]');
    expect(
      await toastComponent.evaluate((el) => el.classList.contains('show')),
    ).toBe(true);
    expect(
      await toastComponent.evaluate((el) => el.classList.contains('hide')),
    ).toBe(false);
    const toastMessage = await page.$('[data-testid="toast-message"]');
    expect(await toastMessage.evaluate((el) => el.textContent)).toBe(
      'application updated successfully!',
    );
  });
});
