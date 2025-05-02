const puppeteer = require('puppeteer');

const {
  fetchedApplications,
  acceptedApplications,
} = require('../../mock-data/applications');
const { superUserForAudiLogs } = require('../../mock-data/users');
const {
  STAGING_API_URL,
  LOCAL_TEST_PAGE_URL,
} = require('../../mock-data/constants');

describe('Filter Component Core Functionality', () => {
  let browser;
  let page;

  jest.setTimeout(60000);

  const filterButtonSelector = '[data-testid="filter-component-toggle-button"]';
  const filterModalSelector = '[data-testid="filter-component-modal"]';
  const applyFilterButtonSelector =
    '[data-testid="apply-filter-component-button"]';
  const clearFilterButtonSelector =
    '[data-testid="filter-component-clear-button"]';
  const activeFilterTagsSelector = '[data-testid="active-filter-tags"]';

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
      if (url === `${STAGING_API_URL}/applications?dev=true`) {
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
      } else {
        interceptedRequest.continue();
      }
    });

    await page.goto(`${LOCAL_TEST_PAGE_URL}/applications?dev=true`);
    await page.waitForSelector(filterButtonSelector);
  });

  afterEach(async () => {
    await page.close();
    await browser.close();
  });

  it('should render filter toggle button and hide filter modal when page load', async () => {
    const filterButton = await page.$(filterButtonSelector);
    expect(filterButton).toBeTruthy();
    const filterModal = await page.$(filterModalSelector);
    expect(filterModal).toBeTruthy();
    const isModalHidden = await page.$eval(filterModalSelector, (el) =>
      el.classList.contains('hidden'),
    );
    expect(isModalHidden).toBe(true);
  });

  it('should open filter modal with options on when click on filter toggle button', async () => {
    await page.click(filterButtonSelector);
    await page.waitForSelector(`${filterModalSelector}:not(.hidden)`);

    const isModalHidden = await page.$eval(filterModalSelector, (el) =>
      el.classList.contains('hidden'),
    );
    expect(isModalHidden).toBe(false);
    const applyButton = await page.$(applyFilterButtonSelector);
    expect(applyButton).toBeTruthy();
    const clearButton = await page.$(clearFilterButtonSelector);
    expect(clearButton).toBeTruthy();
    const acceptedCheckbox = await page.$(
      `input[type="checkbox"][id="ACCEPTED"]`,
    );
    expect(acceptedCheckbox).toBeTruthy();
    const pendingCheckbox = await page.$(
      `input[type="checkbox"][id="PENDING"]`,
    );
    expect(pendingCheckbox).toBeTruthy();
    const rejectedCheckbox = await page.$(
      `input[type="checkbox"][id="REJECTED"]`,
    );
    expect(rejectedCheckbox).toBeTruthy();
  });

  it('should toggle the clear button state based on checkbox selection', async () => {
    await page.click(filterButtonSelector);
    await page.waitForSelector(`${filterModalSelector}:not(.hidden)`);

    let isClearButtonDisabled = await page.$eval(
      clearFilterButtonSelector,
      (el) => el.disabled,
    );
    expect(isClearButtonDisabled).toBe(true);

    await page.click(`input[type="checkbox"][id="ACCEPTED"]`);
    isClearButtonDisabled = await page.$eval(
      clearFilterButtonSelector,
      (el) => el.disabled,
    );
    expect(isClearButtonDisabled).toBe(false);

    await page.click(`input[type="checkbox"][id="ACCEPTED"]`);
    isClearButtonDisabled = await page.$eval(
      clearFilterButtonSelector,
      (el) => el.disabled,
    );
    expect(isClearButtonDisabled).toBe(true);
  });

  it('should apply filter, update URL, and display the corresponding filter tag', async () => {
    const statusToApply = 'ACCEPTED';

    await page.click(filterButtonSelector);
    await page.waitForSelector(`${filterModalSelector}:not(.hidden)`);

    await page.click(`input[type="checkbox"][id="${statusToApply}"]`);

    await page.click(applyFilterButtonSelector);
    await page.waitForSelector(`${filterModalSelector}.hidden`);
    await page.waitForNetworkIdle();

    expect(page.url()).toContain(`status=${statusToApply.toLowerCase()}`);

    const filterTagSelector = `${activeFilterTagsSelector} .filter__component__tag[data-status="${statusToApply}"]`;
    const displayedTag = await page.$(filterTagSelector);
    expect(displayedTag).toBeTruthy();

    const isModalHidden = await page.$eval(filterModalSelector, (el) =>
      el.classList.contains('hidden'),
    );
    expect(isModalHidden).toBe(true);
  });

  it('should clear filter via Clear button', async () => {
    const statusToApply = 'PENDING';

    await page.click(filterButtonSelector);
    await page.waitForSelector(`${filterModalSelector}:not(.hidden)`);
    await page.click(`input[type="checkbox"][id="${statusToApply}"]`);
    await page.click(applyFilterButtonSelector);
    await page.waitForSelector(`${filterModalSelector}.hidden`);
    await page.waitForNetworkIdle();
    expect(page.url()).toContain(`status=${statusToApply.toLowerCase()}`);

    await page.click(filterButtonSelector);
    await page.waitForSelector(`${filterModalSelector}:not(.hidden)`);
    await page.click(clearFilterButtonSelector);
    await page.waitForSelector(filterModalSelector + '.hidden');
    await page.waitForNetworkIdle();

    expect(page.url()).not.toContain('status=');
    const tag = await page.$(
      `${activeFilterTagsSelector} .filter__component__tag[data-status="${statusToApply}"]`,
    );
    expect(tag).toBeFalsy();

    await page.click(filterButtonSelector);
    await page.waitForSelector(`${filterModalSelector}:not(.hidden)`);
    const isPendingChecked = await page.$eval(
      `input[type="checkbox"][id="${statusToApply}"]`,
      (el) => el.checked,
    );
    expect(isPendingChecked).toBe(false);
    const isClearButtonDisabled = await page.$eval(
      clearFilterButtonSelector,
      (el) => el.disabled,
    );
    expect(isClearButtonDisabled).toBe(true);
  });

  it('should clear filter via tag close icon', async () => {
    const statusToApply = 'ACCEPTED';

    await page.click(filterButtonSelector);
    await page.waitForSelector(`${filterModalSelector}:not(.hidden)`);
    await page.click(`input[type="checkbox"][id="${statusToApply}"]`);
    await page.click(applyFilterButtonSelector);
    await page.waitForSelector(filterModalSelector + '.hidden');
    await page.waitForNetworkIdle();
    expect(page.url()).toContain(`status=${statusToApply.toLowerCase()}`);
    const tagSelector = `${activeFilterTagsSelector} .filter__component__tag[data-status="${statusToApply}"]`;
    let tag = await page.$(tagSelector);
    expect(tag).toBeTruthy();

    await page.click(`${tagSelector} .filter__component__tag__close`);
    await page.waitForNetworkIdle();

    expect(page.url()).not.toContain('status=');
    tag = await page.$(tagSelector);
    expect(tag).toBeFalsy();

    await page.click(filterButtonSelector);
    await page.waitForSelector(`${filterModalSelector}:not(.hidden)`);
    const isAcceptedChecked = await page.$eval(
      `input[type="checkbox"][id="${statusToApply}"]`,
      (el) => el.checked,
    );
    expect(isAcceptedChecked).toBe(false);
    const isClearButtonDisabled = await page.$eval(
      clearFilterButtonSelector,
      (el) => el.disabled,
    );
    expect(isClearButtonDisabled).toBe(true);
  });

  it('should apply the appropriate filter and tag based on the page URL', async () => {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/applications?status=accepted&dev=true`,
    );
    await page.waitForNetworkIdle();

    const acceptedStatus = 'ACCEPTED';
    const tag = await page.$(
      `${activeFilterTagsSelector} .filter__component__tag[data-status="${acceptedStatus}"]`,
    );
    expect(tag).toBeTruthy();

    await page.click(filterButtonSelector);
    await page.waitForSelector(`${filterModalSelector}:not(.hidden)`);
    const isAcceptedChecked = await page.$eval(
      `input[type="checkbox"][id="${acceptedStatus}"]`,
      (el) => el.checked,
    );
    expect(isAcceptedChecked).toBe(true);
    const isClearButtonEnabled = await page.$eval(
      clearFilterButtonSelector,
      (el) => !el.disabled,
    );
    expect(isClearButtonEnabled).toBe(true);
  });

  it('should apply only one filter on application page', async () => {
    await page.click(filterButtonSelector);
    await page.waitForSelector(`${filterModalSelector}:not(.hidden)`);

    await page.click(`input[type="checkbox"][id="PENDING"]`);
    let isPendingChecked = await page.$eval(
      `input[type="checkbox"][id="PENDING"]`,
      (el) => el.checked,
    );
    expect(isPendingChecked).toBe(true);

    await page.click(`input[type="checkbox"][id="ACCEPTED"]`);

    let isAcceptedChecked = await page.$eval(
      `input[type="checkbox"][id="ACCEPTED"]`,
      (el) => el.checked,
    );
    expect(isAcceptedChecked).toBe(true);

    isPendingChecked = await page.$eval(
      `input[type="checkbox"][id="PENDING"]`,
      (el) => el.checked,
    );
    expect(isPendingChecked).toBe(false);
  });
});
