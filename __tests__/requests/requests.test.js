const puppeteer = require('puppeteer');
const {
  pendingRequest,
  requestActionResponse,
  approvedRequest,
  extensionRequest,
  onboardingExtensionRequest,
} = require('../../mock-data/requests');
const { allUsersData, userRandhir } = require('../../mock-data/users');
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
        url === `${STAGING_API_URL}/requests?dev=true&type=EXTENSION&size=12`
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
      } else if (url === `${STAGING_API_URL}/users?search=randhir&size=5`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(userRandhir),
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

  it('should not show the error toast ui after reloading a page', async () => {
    await page.click('#extension_tab_link');
    expect(page.url()).toContain('type=extension');
    await page.reload();
    expect(page.url()).toContain('type=extension');
    const isErrorToastHidden = await page.$eval(
      '[data-testid="toast"]',
      (e) => e.classList.contains('hidden') && e.classList.length == 1,
    );
    expect(isErrorToastHidden).toBe(true);
  });

  it('should match the request page url with correct request tab link after reloading the page', async () => {
    await page.click('#extension_tab_link');
    expect(page.url()).toContain('type=extension');

    await page.reload();
    expect(page.url()).toContain('type=extension');

    const isExtensionTabLinkSelected = await page.$eval(
      '[data-testid="extension-tab"]',
      (e) => e.classList.contains('selected__tab'),
    );
    const isOnboardingTabLinkSelected = await page.$eval(
      '[data-testid="onboarding-tab"]',
      (e) => e.classList.contains('selected__tab'),
    );
    const isOOOTabLinkSelected = await page.$eval(
      '[data-testid="ooo-tab"]',
      (e) => e.classList.contains('selected__tab'),
    );

    expect(isExtensionTabLinkSelected).toBe(true);
    expect(isOnboardingTabLinkSelected).toBe(false);
    expect(isOOOTabLinkSelected).toBe(false);
  });

  it('should update the card when the accept or reject button is clicked for OOO requests', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/requests`);
    await page.waitForNetworkIdle();

    await page.click('#ooo_tab_link');
    expect(page.url()).toContain('type=ooo');

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
    expect(cardTitle).toBe('Reason: request message');

    const statusButtonText = await page.$eval(
      '.request__status',
      (el) => el.textContent,
    );
    expect(statusButtonText).toBe('Approved');
  });

  it('should show requests cards after reloading the page', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/requests`);
    await page.waitForNetworkIdle();

    await page.click('#extension_tab_link');
    expect(page.url()).toContain('type=extension');

    await page.reload();
    expect(page.url()).toContain('type=extension');

    await page.waitForSelector('[data-testid="extension-request-card"]', {
      state: 'visible',
    });
    const extensionCards = await page.$$(
      '[data-testid="extension-request-card"]',
    );
    expect(extensionCards.length).toBe(1);

    await page.click('#ooo_tab_link');
    expect(page.url()).toContain('type=ooo');

    await page.reload();
    expect(page.url()).toContain('type=ooo');

    await page.waitForSelector('[data-testid="ooo-request-card"]', {
      state: 'visible',
    });
    const oooCards = await page.$$('[data-testid="ooo-request-card"]');
    expect(oooCards.length).toBe(1);
  });

  describe('Onboarding Requests UI', () => {
    beforeAll(async () => {
      await page.goto(`${LOCAL_TEST_PAGE_URL}/requests`);
      await page.waitForNetworkIdle();
    });

    it('should display the onboarding extension tab ', async () => {
      await page.waitForNetworkIdle();
      const onboardingTabLink = await page.$('[data-testid="onboarding-tab"]');
      expect(await onboardingTabLink.isVisible()).toBe(true);
    });

    it('should display onboarding extension requests after clicking the onboarding tab', async () => {
      await page.click('#onboarding_extension_tab_link');

      await page.waitForSelector('[data-testid="onboarding-request-card"]', {
        state: 'visible',
      });

      const onboardingExtensionRequestCards = await page.$$(
        '[data-testid="onboarding-request-card"]',
      );

      expect(onboardingExtensionRequestCards.length).toEqual(
        onboardingExtensionRequest.data.length,
      );

      const statusButtonText = await page.$eval(
        '[data-testid="request-status"]',
        (el) => el.textContent,
      );
      expect(statusButtonText.toLowerCase()).toBe(
        onboardingExtensionRequest.data[0].state.toLowerCase(),
      );
    });

    it('should show action buttons and input field only for pending requests', async () => {
      const onboardingTabLink = await page.$('[data-testid="onboarding-tab"]');
      await onboardingTabLink.click();
      await page.waitForSelector('[data-testid="onboarding-request-card"]');

      const requestCards = await page.$$(
        '[data-testid="onboarding-request-card"]',
      );
      expect(requestCards.length).toBeGreaterThan(0);

      for (const card of requestCards) {
        const statusText = await card.$eval(
          '[data-testid="request-status"]',
          (el) => el.textContent.trim(),
        );

        const actionContainer = await card.$(
          '[data-testid="action-container"]',
        );
        const approveButton = await card.$('[data-testid="approve-button"]');
        const rejectButton = await card.$('[data-testid="reject-button"]');
        const remarkInput = await card.$(
          '[data-testid="request-remark-input"]',
        );

        if (statusText === 'Pending') {
          expect(await actionContainer.isVisible()).toBe(true);
          expect(await approveButton.isVisible()).toBe(true);
          expect(await rejectButton.isVisible()).toBe(true);
          expect(await remarkInput.isVisible()).toBe(true);
        } else {
          expect(await actionContainer.isVisible()).toBe(false);
          expect(await approveButton.isVisible()).toBe(false);
          expect(await rejectButton.isVisible()).toBe(false);
          expect(await remarkInput.isVisible()).toBe(false);
        }
      }
    });

    it('should display superuser details only for non-pending requests', async () => {
      const onboardingTabLink = await page.$('[data-testid="onboarding-tab"]');
      await onboardingTabLink.click();
      await page.waitForSelector('[data-testid="onboarding-request-card"]');

      const requestCards = await page.$$(
        '[data-testid="onboarding-request-card"]',
      );
      expect(requestCards.length).toBeGreaterThan(0);

      for (const card of requestCards) {
        const statusText = await card.$eval(
          '[data-testid="request-status"]',
          (el) => el.textContent.trim(),
        );

        const superuserSection = await card.$(
          '[data-testid="admin-info-and-status"]',
        );

        if (statusText === 'Pending') {
          expect(await superuserSection.isVisible()).toBe(false);
        } else {
          expect(await superuserSection.isVisible()).toBe(true);
        }
      }
    });
  });

  describe('Filter Functionality', () => {
    beforeAll(async () => {
      await page.goto(`${LOCAL_TEST_PAGE_URL}/requests`);
      await page.waitForNetworkIdle();
    });
    it('should display filter container and its elements', async () => {
      const filterContainer = await page.$('[data-testid="filter-container"]');
      expect(await filterContainer.isVisible()).toBe(true);
      const usernameInput = await page.$('[data-testid="assignee-search"]');
      expect(await usernameInput.isVisible()).toBe(true);

      const userSuggestionsContainer = await page.$(
        '[data-testid="user-suggestions-container"]',
      );
      expect(userSuggestionsContainer).not.toBeNull();

      const filterToggleButton = await page.$(
        '[data-testid="filter-toggle-button"]',
      );
      expect(await filterToggleButton.isVisible()).toBe(true);

      const filterModal = await page.$('[data-testid="filter-modal"]');
      expect(await filterModal.isVisible()).toBe(false);
    });

    it('should toggle filter modal visibility when the filter toggle button is clicked', async () => {
      const filterModal = await page.$('[data-testid="filter-modal"]');
      expect(await filterModal.isVisible()).toBe(false);

      const filterToggleButton = await page.$(
        '[data-testid="filter-toggle-button"]',
      );
      await filterToggleButton.click();

      expect(await filterModal.isVisible()).toBe(true);
    });

    it('should render filter modal elements', async () => {
      const filterToggleButton = await page.$(
        '[data-testid="filter-toggle-button"]',
      );
      await filterToggleButton.click();

      const filterHeader = await page.$(
        '#filterOptionsContainer .filter__header',
      );
      expect(filterHeader).not.toBeNull();

      const filterTitle = await filterHeader.$('.filter__title');
      const titleText = await filterTitle.evaluate((el) => el.textContent);
      expect(titleText).toContain('Filter By Status');

      const clearButton = await page.$('[data-testid="filter-clear-button"]');
      const clearButtonText = await clearButton.evaluate(
        (el) => el.textContent,
      );
      expect(clearButtonText).toContain('Clear');

      const radioButtons = await page.$$(
        'input[type="radio"][name="status-filter"]',
      );
      expect(radioButtons.length).toBe(3);
    });

    it('should close the filter modal when click on clear button', async () => {
      const filterToggleButton = await page.$(
        '[data-testid="filter-toggle-button"]',
      );
      await filterToggleButton.click();

      const clearButton = await page.$('[data-testid="filter-clear-button"]');
      await clearButton.click();
      const filterModal = await page.$('[data-testid="filter-modal"]');
      expect(await filterModal.isVisible()).toBe(false);
    });

    it('should close the filter modal when click on apply filter button', async () => {
      const filterToggleButton = await page.$(
        '[data-testid="filter-toggle-button"]',
      );
      await filterToggleButton.click();

      const applyFilterButton = await page.$(
        '[data-testid="apply-filter-button"]',
      );
      await applyFilterButton.click();
      const filterModal = await page.$('[data-testid="filter-modal"]');
      expect(await filterModal.isVisible()).toBe(false);
    });

    it('should have no filters applied initially', async () => {
      const selectedStatusRadio = await page.$(
        'input[type="radio"][name="status-filter"]:checked',
      );
      expect(selectedStatusRadio).toBeNull();
    });

    it('should render the correct requests based on the selected filter state', async () => {
      const filterToggleButton = await page.$(
        '[data-testid="filter-toggle-button"]',
      );
      await filterToggleButton.click();

      const approvedRadio = await page.$(
        'input[type="radio"][name="status-filter"][value="APPROVED"]',
      );
      await approvedRadio.click();

      const applyFilterButton = await page.$(
        '[data-testid="apply-filter-button"]',
      );
      await applyFilterButton.click();

      const requestCards = await page.$$('[data-testid="ooo-request-card"]');

      for (const card of requestCards) {
        const statusText = await card.$eval(
          '[data-testid="request-status"]',
          (el) => el.textContent,
        );
        expect(statusText).toContain('Approved');
      }
    });

    it('should show suggestions only after minimum character threshold', async () => {
      await page.waitForSelector('#assignee-search-input', { visible: true });

      const partialQuery = 'ra';
      await page.type('#assignee-search-input', partialQuery, { delay: 100 });

      await page.waitForNetworkIdle();

      let suggestionCount = await page.$$eval(
        '.suggestion',
        (elements) => elements.length,
      );

      expect(suggestionCount).toBe(0);

      await page.type('#assignee-search-input', 'ndhir', { delay: 100 });
      await page.waitForNetworkIdle();
      suggestionCount = await page.$$eval(
        '.suggestion',
        (elements) => elements.length,
      );

      expect(suggestionCount).toBeGreaterThan(0);
    });
    it('should show user suggestions after debounced input', async () => {
      await page.waitForSelector('#assignee-search-input', { visible: true });
      await page.$eval('#assignee-search-input', (input) => (input.value = ''));
      let username = 'randhir';
      await page.type('#assignee-search-input', username, { delay: 100 });

      await page.waitForNetworkIdle();

      const suggestionCount = await page.$$eval(
        '.suggestion',
        (elements) => elements.length,
      );
      const suggestions = await page.$$eval('.suggestion', (elements) =>
        elements.map((el) => el.textContent?.trim()),
      );

      expect(suggestionCount).toBeGreaterThan(0);
      expect(suggestions).toContain(username);
    });

    it('should show no suggestions if no matching users exist', async () => {
      await page.waitForSelector('#assignee-search-input', { visible: true });

      await page.$eval('#assignee-search-input', (input) => (input.value = ''));

      let randomUsername = 'xyzabc';
      await page.type('#assignee-search-input', randomUsername, { delay: 100 });

      await page.waitForNetworkIdle();

      const suggestionCount = await page.$$eval(
        '.suggestion',
        (elements) => elements.length,
      );

      expect(suggestionCount).toBe(0);
    });

    it('should handle special characters gracefully', async () => {
      await page.waitForSelector('#assignee-search-input', { visible: true });

      await page.type('#assignee-search-input', '@#$%', { delay: 100 });

      await page.waitForNetworkIdle();

      const suggestionCount = await page.$$eval(
        '.suggestion',
        (elements) => elements.length,
      );

      expect(suggestionCount).toBe(0);
    });
  });

  it.skip('should show success toast after approving any request', async function () {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/requests?dev=true`);
    await page.waitForNetworkIdle();
    await page.click('#ooo_tab_link');
    await page.waitForSelector('.request__status');

    const statusButtonText = await page.$eval(
      '.request__status',
      (el) => el.textContent,
    );
    expect(statusButtonText).toBe('Pending');

    await page.click('.request__action__btn.accept__btn');
    await page.waitForSelector('[data-testid="toast-component"].show');
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
    ).toBe(true);
    expect(
      await toastComponent.evaluate((el) =>
        el.classList.contains('error__toast'),
      ),
    ).toBe(false);
    const toastMessage = await page.$('[data-testid="toast-message"]');
    expect(await toastMessage.evaluate((el) => el.textContent)).toBe(
      'Request approved successfully',
    );
  });
});
