const puppeteer = require('puppeteer');

const { fetchedTaskRequests } = require('../../mock-data/taskRequests');
const {
  LOCAL_TEST_PAGE_URL,
  STAGING_API_URL,
} = require('../../mock-data/constants');

describe('Task Requests', () => {
  let browser;
  let page;
  jest.setTimeout(60000);

  beforeEach(async () => {
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

      if (
        url === `${STAGING_API_URL}/taskRequests` ||
        url ===
          `${STAGING_API_URL}/taskRequests?size=20&q=status%3Apending+sort%3Acreated-asc`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: fetchedTaskRequests }),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } else if (
        url ===
          `${STAGING_API_URL}/taskRequests?size=20&q=status%3Aapproved++sort%3Acreated-asc` ||
        url ===
          `${STAGING_API_URL}/taskRequests?size=20&q=status%3Aapproved+sort%3Acreated-asc`
      ) {
        const list = [];
        for (let i = 0; i < 20; i++) {
          list.push(fetchedTaskRequests[0]);
        }
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: list,
            next: '/taskRequests?size=20&q=status%3Aapproved++sort%3Acreated-asc',
          }),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto(`${LOCAL_TEST_PAGE_URL}/task-requests`);
    await page.waitForNetworkIdle();
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });
  describe('When the user is super user', () => {
    it('should display the task requests card', async () => {
      const taskCards = await page.$$('.taskRequest__card');
      const title = await taskCards[0].evaluate(
        (el) => el.children[0].textContent,
      );
      const purpose = await taskCards[0].evaluate(
        (el) => el.children[1].textContent,
      );

      expect(taskCards).toHaveLength(1);
      expect(title).toMatch(/test title/i);
      expect(purpose).toMatch(/test purpose/i);
    });
    describe('Filter Modal', () => {
      it('should be hidden initially', async () => {
        const modal = await page.$('.filter-modal');
        expect(
          await modal.evaluate((el) => el.classList.contains('hidden')),
        ).toBe(true);
      });

      it('should be displayed after clicking the filter button and hidden on outside click', async () => {
        const modal = await page.$('.filter-modal');
        const filterHead = await page.$('.filter-head');
        const filterContainer = await page.$('.filters-container');
        expect(filterHead).toBeTruthy();
        expect(filterContainer).toBeTruthy();
        await page.click('#filter-button');
        expect(modal).not.toBeNull();
        expect(
          await modal.evaluate((el) => el.classList.contains('hidden')),
        ).toBe(false);
        await page.mouse.click(200, 200);
        expect(
          await modal.evaluate((el) => el.classList.contains('hidden')),
        ).toBe(true);
      });

      it('checks if PENDING is checked by default', async () => {
        const filterButton = await page.$('#filter-button');
        await filterButton.click();
        await page.waitForSelector('.filter-modal');
        const activeFilter = await page.$('input[value="PENDING"]');
        const currentState = await activeFilter.getProperty('checked');
        const isChecked = await currentState.jsonValue();
        expect(isChecked).toBe(true);
      });

      it('Selecting filters and clicking on apply should filter task request list', async () => {
        let cardsList = await page.$$('.taskRequest__card');
        expect(cardsList).not.toBeNull();
        const initialLength = cardsList.length;
        await page.click('#filter-button');
        await page.click('input[value="PENDING"]');
        await page.click('input[value="APPROVED"]');
        await page.click('#apply-filter-button');
        await page.waitForNetworkIdle();
        cardsList = await page.$$('.taskRequest__card');
        expect(cardsList).not.toBeNull();
        expect(cardsList.length).toBeGreaterThanOrEqual(0);
        expect(cardsList.length).not.toBe(initialLength);
      });

      it('clears the filter when the Clear button is clicked', async () => {
        const filterButton = await page.$('#filter-button');
        await filterButton.click();
        await page.waitForSelector('.filter-modal');
        const activeFilter = await page.$('input[value="APPROVED"]');
        await activeFilter.click();
        const clearButton = await page.$('.filter-modal #clear-button');
        await clearButton.click();
        await page.waitForSelector('.filter-modal', { hidden: true });
        const currentState = await activeFilter.getProperty('checked');
        const isChecked = await currentState.jsonValue();
        expect(isChecked).toBe(false);
      });

      it('should show approved task requests when the approved filter is applied and dev=true', async () => {
        await page.goto(`${LOCAL_TEST_PAGE_URL}/task-requests?dev=true`);
        await page.waitForNetworkIdle();
        await page.click('[data-testid="filter-component-toggle-button"]');
        const applyFilterButton =
          '[data-testid="apply-filter-component-button"]';
        await page.waitForSelector(applyFilterButton, { visible: true });
        await page.click(`input[type="checkbox"][id="APPROVED"]`);
        await page.click(applyFilterButton);
        await page.waitForNetworkIdle();
        const taskRequestList = await page.$$('.taskRequest__card');
        expect(taskRequestList.length).toBe(20);
      });
    });

    describe('Sort Modal', () => {
      it('should be hidden initially', async () => {
        const sortModal = await page.$('.sort-modal');
        const assigneButton = await page.$('#REQUESTORS_COUNT_ASC');
        expect(
          await sortModal.evaluate((el) => el.classList.contains('hidden')),
        ).toBe(true);
        expect(assigneButton).toBeTruthy();
      });

      it('should toggle visibility sort modal by clicking the sort button and selecting an option', async () => {
        const sortModal = await page.$('.sort-modal');
        const assigneButton = await page.$('#REQUESTORS_COUNT_ASC');
        const sortHead = await page.$('.sort-head');
        const sortContainer = await page.$('.sorts-container');

        expect(sortHead).toBeTruthy();
        expect(sortContainer).toBeTruthy();

        await page.click('.sort-button');
        await page.click('#REQUESTORS_COUNT_ASC');
        expect(
          await assigneButton.evaluate((el) =>
            el.classList.contains('selected'),
          ),
        ).toBe(true);
        expect(
          await sortModal.evaluate((el) => el.classList.contains('hidden')),
        ).toBe(true);
        await page.click('.sort-button');
        await page.click('#REQUESTORS_COUNT_ASC');
        expect(
          await assigneButton.evaluate((el) =>
            el.classList.contains('selected'),
          ),
        ).toBe(false);
        expect(
          await sortModal.evaluate((el) => el.classList.contains('hidden')),
        ).toBe(true);
      });
    });

    it('Checks that new items are loaded when scrolled to the bottom', async () => {
      await page.click('#filter-button');
      await page.click('input[value="PENDING"]');
      await page.click('input[value="APPROVED"]');
      await page.click('#apply-filter-button');
      await page.waitForNetworkIdle();
      let taskRequestList = await page.$$('.taskRequest__card');
      expect(taskRequestList.length).toBe(20);
      await page.evaluate(() => {
        const element = document.querySelector('.virtual');
        if (element) {
          element.scrollIntoView({ behavior: 'auto' });
        }
      });
      await page.waitForNetworkIdle();
      taskRequestList = await page.$$('.taskRequest__card');
      expect(taskRequestList.length).toBe(40);
    });
  });
});

describe('createCustomElement', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
    });

    page = await browser.newPage();

    await page.goto(`${LOCAL_TEST_PAGE_URL}/task-requests`);
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('tagName', () => {
    it('should create tag with provided tagName', async () => {
      const tag = await page.evaluate(
        () => createCustomElement({ tagName: 'p' }).tagName,
      );
      expect(tag).toMatch(/p/i);
    });

    it('should not add tagName attribute', async () => {
      const tagNameAttr = await page.evaluate(() =>
        createCustomElement({ tagName: 'p' }).getAttribute('tagName'),
      );

      expect(tagNameAttr).toBeNull();
    });
  });

  describe('className', () => {
    it('should add the class when class key is provided using string', async () => {
      const classes = await page.evaluate(() => [
        ...createCustomElement({ tagName: 'p', class: 'test-class' }).classList,
      ]);

      expect(classes).toHaveLength(1);
      expect(classes).toContain('test-class');
    });

    it('should add multiple classes when class key has array as value', async () => {
      const classes = await page.evaluate(() => [
        ...createCustomElement({
          tagName: 'p',
          class: ['test-class-1', 'test-class-2'],
        }).classList,
      ]);

      expect(classes).toHaveLength(2);
      expect(classes).toStrictEqual(['test-class-1', 'test-class-2']);
    });
  });

  describe('textContent', () => {
    it('should add textContent key when specified', async () => {
      const textContent = await page.evaluate(
        () =>
          createCustomElement({ tagName: 'p', textContent: 'test content' })
            .textContent,
      );

      expect(textContent).toBe('test content');
    });
  });
});

describe('urlParams', () => {
  beforeEach(async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/task-requests`);
    await page.waitForNetworkIdle();
  });

  it('Should update page url for default filter and sort by', async () => {
    const url = page.url();
    expect(url).toBe(
      `${LOCAL_TEST_PAGE_URL}/task-requests?sort=created-asc&status=pending`,
    );
  });

  it('Should update page url when filter is changed', async () => {
    await page.click('#filter-button');
    await page.click('input[value="APPROVED"]');
    await page.click('input[value="DENIED"]');
    await page.click('input[value="assignment"]');
    await page.click('input[value="creation"]');
    await page.click('#apply-filter-button');
    await page.waitForNetworkIdle();
    const url = page.url();

    expect(url).toBe(
      `${LOCAL_TEST_PAGE_URL}/task-requests?sort=created-asc&status=approved&status=pending&status=denied&request-type=assignment&request-type=creation`,
    );
  });

  it('Should update page url when sort by is changed', async () => {
    await page.click('.sort-button');
    await page.click('#REQUESTORS_COUNT_ASC');
    await page.waitForNetworkIdle();
    const url = page.url();

    expect(url).toBe(
      `${LOCAL_TEST_PAGE_URL}/task-requests?sort=requestors-asc&status=pending`,
    );
  });

  it('Should have UI elements in sync with url', async () => {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/task-requests?sort=created-desc&status=approved&status=pending&status=denied&request-type=assignment&request-type=creation`,
    );
    await page.click('#filter-button');
    await page.waitForSelector('.filter-modal');

    const approvedFilter = await page.$('input[value="APPROVED"]');
    const pendingFilter = await page.$('input[value="PENDING"]');
    const deniedFilter = await page.$('input[value="DENIED"]');

    const isApprovedChecked = await (
      await approvedFilter.getProperty('checked')
    ).jsonValue();
    const isPendingChecked = await (
      await pendingFilter.getProperty('checked')
    ).jsonValue();
    const isDeniedChecked = await (
      await deniedFilter.getProperty('checked')
    ).jsonValue();

    expect(isApprovedChecked).toBe(true);
    expect(isPendingChecked).toBe(true);
    expect(isDeniedChecked).toBe(true);

    const newestFirst = await page.$('#CREATED_TIME_DESC');
    const newestFirstClass = await (
      await newestFirst.getProperty('className')
    ).jsonValue();
    expect(newestFirstClass).toContain('selected');
  });
});

describe('Sort Icon Functionality', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
      devtools: false,
    });

    page = await browser.newPage();
  });

  beforeEach(async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/task-requests/?dev=true`);
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  const getSortIconDetails = async (iconId) => {
    const iconElement = await page.$(`#${iconId}`);
    const display = await page.evaluate(
      (el) => window.getComputedStyle(el).display,
      iconElement,
    );
    return display;
  };

  const getSortParameterDetails = async () => {
    const sortParameterElement = await page.$('.sort-button__text');
    const sortParameter = await page.evaluate(
      (el) => el.textContent,
      sortParameterElement,
    );
    return sortParameter;
  };

  it('updates sort icon display and sort parameter text when sort by is changed', async () => {
    let ascSortIconDisplay = await getSortIconDetails('asc-sort-icon');
    let descSortIconDisplay = await getSortIconDetails('desc-sort-icon');
    let sortParameter = await getSortParameterDetails();

    expect(ascSortIconDisplay).toBe('block');
    expect(descSortIconDisplay).toBe('none');
    expect(sortParameter).toBe('created');

    await page.click('.sort-button');
    await page.click('#REQUESTORS_COUNT_DESC');
    await page.waitForNetworkIdle();

    ascSortIconDisplay = await getSortIconDetails('asc-sort-icon');
    descSortIconDisplay = await getSortIconDetails('desc-sort-icon');
    sortParameter = await getSortParameterDetails();

    expect(ascSortIconDisplay).toBe('none');
    expect(descSortIconDisplay).toBe('block');
    expect(sortParameter).toBe('requestors');
  });

  it('ensures sort icon display and sort parameter text are in sync with URL parameters', async () => {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/task-requests?sort=requestors-desc&dev=true`,
    );

    const ascSortIconDisplay = await getSortIconDetails('asc-sort-icon');
    const descSortIconDisplay = await getSortIconDetails('desc-sort-icon');
    const sortParameter = await getSortParameterDetails();

    expect(ascSortIconDisplay).toBe('none');
    expect(descSortIconDisplay).toBe('block');
    expect(sortParameter).toBe('requestors');
  });
});

describe('badges', () => {
  const DENIED = 'DENIED';
  const ASSIGNMENT = 'ASSIGNMENT';
  let browser;
  let page;

  const getBadgeTexts = async (page) => {
    const badges = await page.$$('.filter__component__tag');
    return Promise.all(
      badges.map((badge) => page.evaluate((el) => el.textContent, badge)),
    );
  };

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
      devtools: false,
    });

    page = await browser.newPage();
  });

  beforeEach(async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/task-requests/?dev=true`);
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('verifies that filters applied by the user are correctly displayed as badges on the screen', async () => {
    await page.click('#filter-component-toggle-button');
    await page.click(`input[value="${DENIED}"]`);
    await page.click(`input[value="${ASSIGNMENT}"]`);
    await page.click('#apply-filter-component-button');
    await page.waitForNetworkIdle();
    const badgeTexts = await getBadgeTexts(page);
    const badgeTextsLowerCase = badgeTexts.map((text) => text.toLowerCase());
    expect(badgeTextsLowerCase).toContain(DENIED.toLowerCase());
    expect(badgeTextsLowerCase).toContain(ASSIGNMENT.toLowerCase());
  });

  it('verifies that badge is removed when clicked and filters are updated accordingly', async () => {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/task-requests/?sort=created-asc&status=pending&status=denied&dev=true`,
    );
    await page.waitForNetworkIdle();

    const badges = await page.$$('.filter__component__tag');
    let badgeTexts = await getBadgeTexts(page);
    const badgeTextsLowerCase = badgeTexts.map((text) => text.toLowerCase());

    expect(badgeTextsLowerCase).toContain(DENIED.toLowerCase());
    expect(badgeTextsLowerCase).toContain('pending');

    const deniedIndex = badgeTextsLowerCase.indexOf(DENIED.toLowerCase());
    const deniedBadge = badges[deniedIndex];
    const closeButton = await deniedBadge.$('.filter__component__tag__close');
    await closeButton.click();
    badgeTexts = await getBadgeTexts(page);
    expect(badgeTexts).not.toContain(DENIED.toLowerCase());

    const checkbox = await page.$(`input[value="${DENIED}"]`);
    const isChecked = await page.evaluate((el) => el.checked, checkbox);
    expect(isChecked).toBe(false);
  });

  it('verifies that badges are displayed based on URL parameters and removes all badges when the Clear all button is clicked', async () => {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/task-requests/?sort=created-asc&status=denied&request-type=assignment&dev=true`,
    );
    await page.waitForNetworkIdle();

    let badgeTexts = (await getBadgeTexts(page)).map((badge) =>
      badge.toUpperCase(),
    );
    expect(badgeTexts).toContain(DENIED);
    expect(badgeTexts).toContain(ASSIGNMENT);

    await page.click('#filter-component-toggle-button');

    await page.click('#filter-component-clear-button');
    await page.waitForNetworkIdle();

    badges = await page.$$('.badge');
    expect(badges.length).toBe(0);
  });

  it('verifies that badge is removed when delete icon is clicked', async () => {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/task-requests/?sort=created-asc&status=denied&dev=true`,
    );

    let badgeTexts = await getBadgeTexts(page);
    expect(badgeTexts).toContain('Denied');

    const deniedBadgeDeleteIcon = await page.$(
      '.filter__component__tag__close',
    );
    await deniedBadgeDeleteIcon.click();

    badgeTexts = await getBadgeTexts(page);
    expect(badgeTexts).not.toContain('Denied');
  });
});
