const puppeteer = require('puppeteer');
const {
  pendingRequest,
  requestActionResponse,
  approvedRequest,
  extensionRequest,
  onboardingExtensionRequest,
} = require('../../mock-data/requests');
const { allUsersData } = require('../../mock-data/users');
const {
  STAGING_API_URL,
  LOCAL_TEST_PAGE_URL,
} = require('../../mock-data/constants');

describe('Tests the request cards', () => {
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
      if (url === `${STAGING_API_URL}/users/search?role=in_discord`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(allUsersData),
        });
      } else if (
        url === `${STAGING_API_URL}/requests?dev=true&type=OOO&size=12`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(pendingRequest),
        });
      } else if (
        url === `${STAGING_API_URL}/requests?dev=true&type=extension&size=12`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequest),
        });
      } else if (
        url === `${STAGING_API_URL}/requests?dev=true&type=ONBOARDING&size=12`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(onboardingExtensionRequest),
        });
      } else if (
        url === `${STAGING_API_URL}/requests/Wl4TTbpSrQDIjs6KLJwD?dev=true`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(requestActionResponse),
        });
      } else if (
        url === `${STAGING_API_URL}/requests?dev=true&id=Wl4TTbpSrQDIjs6KLJwD`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(approvedRequest),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto(`${LOCAL_TEST_PAGE_URL}/requests`);
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should update the card when the accept or reject button is clicked for OOO requests', async () => {
    await page.waitForSelector('.request__status');
    const statusButtonText = await page.$eval(
      '.request__status',
      (el) => el.textContent,
    );
    expect(statusButtonText).toBe('Pending');

    await page.click('.request__action__btn.accept__btn');

    await page.waitForFunction(
      () =>
        document.querySelector('.request__status')?.textContent === 'Approved',
    );

    await page.waitForSelector('.request__status');
    const updatedStatusButtonText = await page.$eval(
      '.request__status',
      (el) => el.textContent,
    );
    expect(updatedStatusButtonText).toBe('Approved');
  });

  it('should load the extension request when the extension tab is clicked', async () => {
    await page.click('#extension_tab_link');
    await page.waitForSelector('.request__card');

    const cardTitle = await page.$eval(
      '.request__content p',
      (el) => el.textContent,
    );
    expect(cardTitle).toBe('request message');

    const statusButtonText = await page.$eval(
      '.request__status',
      (el) => el.textContent,
    );
    expect(statusButtonText).toBe('Approved');
  });

  it('should not render the onboarding extension tab when dev is not true', async () => {
    const onboardingTabLink = await page.$('[data-testid="Onboarding-tab"]');
    const hasHiddenClass = await onboardingTabLink.evaluate((el) =>
      el.classList.contains('hidden'),
    );
    expect(hasHiddenClass).toBe(true);
  });

  it('should render the onboarding extensoin tab when dev is true', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/requests?dev=true`);
    await page.waitForNetworkIdle();
    const onboardingTabLink = await page.$('[data-testid="Onboarding-tab"]');
    const hasHiddenClass = await onboardingTabLink.evaluate((el) =>
      el.classList.contains('hidden'),
    );
    expect(hasHiddenClass).toBe(false);
  });

  it('should render the onboarding requests when onboarding tab is clicked', async () => {
    await page.click('#onboarding_extension_tab_link');
    await page.waitForSelector('[data-testid="request-card"]');

    const statusButtonText = await page.$eval(
      '[data-testid="request-status"]',
      (el) => el.textContent,
    );
    expect(statusButtonText.toLowerCase()).toBe(
      onboardingExtensionRequest.data[0].state.toLowerCase(),
    );
  });

  it('should render approve/reject buttons and superuser details correctly based on status', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/requests?dev=true`);
    const onboardingTabLink = await page.$('[data-testid="Onboarding-tab"]');
    await onboardingTabLink.click();
    await page.waitForSelector('[data-testid="request-card"]');

    const requestCards = await page.$$('[data-testid="request-card"]');
    expect(requestCards.length).toBeGreaterThan(0);

    for (const card of requestCards) {
      const statusText = await card.$eval(
        '[data-testid="request-status"]',
        (el) => el.textContent.trim(),
      );

      const actionContainer = await card.$('[data-testid="action-container"]');
      const superuserSection = await card.$(
        '[data-testid="admin-info-and-status"]',
      );

      const isActionContainerHidden = await actionContainer.evaluate((el) =>
        el.classList.contains('hidden'),
      );
      const isSuperuserSectionHidden = await superuserSection.evaluate((el) =>
        el.classList.contains('hidden'),
      );

      expect(isActionContainerHidden).toBe(statusText !== 'Pending');
      expect(isSuperuserSectionHidden).toBe(statusText === 'Pending');

      if (statusText === 'Pending') {
        const approveButton = await card.$('[data-testid="approve-button"]');
        const rejectButton = await card.$('[data-testid="reject-button"]');
        const remarkInput = await card.$(
          '[data-testid="request-remark-input"]',
        );

        expect(approveButton).toBeTruthy();
        expect(rejectButton).toBeTruthy();
        expect(remarkInput).toBeTruthy();
      }
    }
  });
});
