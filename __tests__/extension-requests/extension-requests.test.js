const puppeteer = require('puppeteer');
const {
  extensionRequestsList,
  extensionRequestsListPending,
  extensionRequestsListApproved,
  extensionRequestResponse,
  extensionRequestsListPendingDescending,
} = require('../../mock-data/extension-requests');

const { userSunny, userRandhir } = require('../../mock-data/users');
const { taskDone } = require('../../mock-data/tasks/index');

describe('Tests the Extension Requests Screen', () => {
  let browser;
  let page;
  let title;
  let searchBar;
  let filterButton;
  let extensionRequestsElement;
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
      if (url === 'https://api.realdevsquad.com/extension-requests') {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestsList),
        });
      } else if (
        url === 'https://api.realdevsquad.com/extension-requests?status=PENDING'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestsListPending),
        });
      } else if (
        url ===
        'https://api.realdevsquad.com/extension-requests?status=ACCEPTED'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestsListApproved),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto('http://localhost:8000/extension-requests');
    await page.waitForNetworkIdle();

    title = await page.$('.header h1');
    searchBar = await page.$('#search');
    filterButton = await page.$('#filter-button');
    extensionRequestsElement = await page.$('.extension-request');
  });

  afterEach(async () => {
    await page.goto('http://localhost:8000/extension-requests');
    await page.waitForNetworkIdle();
  });
  afterAll(async () => {
    await browser.close();
  });

  it('Checks the UI elements on Extension requests listing page.', async () => {
    expect(title).toBeTruthy();
    expect(searchBar).toBeTruthy();
    expect(filterButton).toBeTruthy();

    expect(extensionRequestsElement).toBeTruthy();
  });

  it('checks the search functionality', async () => {
    const ele = await page.$('input[id="assignee-search"]');
    await page.type('#assignee-search', 'sunny');
    await page.waitForTimeout(600); // wait for input debounce timer
    const cardsList = await page.$$('.extension-request');
    expect(cardsList.length).toBe(1);
    const cardTextContent = await page.evaluate(
      (element) => element.textContent,
      cardsList[0],
    );
    expect(cardTextContent).toContain('sunny');
  });

  it('clicking on filter button should display filter modal', async () => {
    const modal = await page.$('.filter-modal');
    expect(await modal.evaluate((el) => el.classList.contains('hidden'))).toBe(
      true,
    );
    await page.click('#filter-button');
    expect(modal).not.toBeNull();
    expect(await modal.evaluate((el) => el.classList.contains('hidden'))).toBe(
      false,
    );
    await page.click('#filter-button');
    expect(await modal.evaluate((el) => el.classList.contains('hidden'))).toBe(
      true,
    );
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

  it('Selecting filters and clicking on apply should filter extension requests list', async () => {
    await page.click('#filter-button');
    await page.click('input[value="PENDING"]');

    await page.click('input[value="APPROVED"]');

    await page.click('#apply-filter-button');
    await page.waitForNetworkIdle();

    const cardsList = await page.$$('.extension-request');

    expect(cardsList).not.toBeNull();
    expect(cardsList.length).toBeGreaterThanOrEqual(0);
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
});

describe.skip('Tests the new Extension Requests Screen', () => {
  let browser;
  let page;
  let title;
  let searchBar;
  let filterButton;
  let extensionRequestsElement;
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
      if (
        url ===
        'https://api.realdevsquad.com/extension-requests?size=10&dev=true&order=asc'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestsList),
        });
      } else if (
        url ===
        'https://api.realdevsquad.com/extension-requests?status=PENDING&size=10&dev=true&order=asc'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestsListPending),
        });
      } else if (
        url ===
        'https://api.realdevsquad.com/extension-requests?status=PENDING&size=10&dev=true&order=desc'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestsListPendingDescending),
        });
      } else if (
        url ===
        'https://api.realdevsquad.com/extension-requests?status=ACCEPTED&size=10&dev=true&order=asc'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestsListApproved),
        });
      } else if (
        url === 'https://api.realdevsquad.com/users?search=sunny&size=1'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(userSunny),
        });
      } else if (
        url === 'https://api.realdevsquad.com/users?search=randhir&size=1'
      ) {
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
      } else if (
        url ===
        'https://api.realdevsquad.com/tasks/PYj79ki2agB0q5JN3kUf/details'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(taskDone),
        });
      } else if (
        url ===
        'https://api.realdevsquad.com/extension-requests/QISvF7kAmnD9vXHwwIsG/status'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestResponse),
        });
      } else if (
        url ===
        'https://api.realdevsquad.com/extension-requests/lGQ3AjUlgNB6Jd8jXaEC/status'
      ) {
        interceptedRequest.respond({
          status: 400,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(extensionRequestResponse),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto('http://localhost:8000/extension-requests/index.html');
    await page.waitForNetworkIdle();
  });

  afterEach(async () => {
    await page.goto('http://localhost:8000/extension-requests/index.html');

    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('Checks the UI elements on Extension requests listing page', async () => {
    title = await page.$('.header h1');
    searchBar = await page.$('#search');
    filterButton = await page.$('#filter-button');
    extensionCardsList = await page.$$('.extension-card');
    extensionRequestsElement = await page.$('.extension-requests-new');

    expect(title).toBeTruthy();
    expect(searchBar).toBeTruthy();
    expect(filterButton).toBeTruthy();
    expect(extensionCardsList.length).toBe(4);
    expect(extensionRequestsElement).toBeTruthy();
  });

  it('Checks details of the first extension card', async () => {
    extensionCardsList = await page.$$('.extension-card');

    const firstExtensionCard = extensionCardsList[0];

    const titleText = await firstExtensionCard.$eval(
      '.title-text',
      (el) => el.textContent,
    );
    expect(titleText).toBe('A title');

    const taskStatusText = await firstExtensionCard.$eval(
      '.task-details-container',
      (el) => el.textContent,
    );
    expect(taskStatusText).toContain('DONE');

    const taskAssigneeName = await firstExtensionCard.$eval(
      '.assignee-name',
      (el) => el.textContent,
    );
    expect(taskAssigneeName).toBe('Sunny');
  });

  it('Checks that accordion content is hidden by default', async () => {
    const firstAccordionContent = await page.$('.extension-card .panel');
    const firstAccordionIsHidden = await firstAccordionContent.evaluate(
      (el) => el.style.maxHeight === '',
    );

    expect(firstAccordionIsHidden).toBe(true);
  });

  it('Opens and closes accordion content on click', async () => {
    const firstAccordionButton = await page.$(
      '.extension-card:first-child .accordion',
    );

    await firstAccordionButton.click();

    const firstAccordionContent = await page.$(
      '.extension-card:first-child .panel',
    );
    const firstAccordionIsVisible = await firstAccordionContent.evaluate(
      (el) => el.style.maxHeight !== '',
    );
    expect(firstAccordionIsVisible).toBe(true);

    await firstAccordionButton.click();

    const firstAccordionIsHidden = await firstAccordionContent.evaluate(
      (el) => el.style.maxHeight === '',
    );
    expect(firstAccordionIsHidden).toBe(true);
  });

  it('Checks that new items are loaded when scrolled to the bottom', async () => {
    extensionCardsList = await page.$$('.extension-card');

    expect(extensionCardsList.length).toBe(4);

    await page.evaluate(() => {
      const element = document.querySelector('.virtual');
      if (element) {
        element.scrollIntoView({ behavior: 'auto' });
      }
    });

    await page.waitForNetworkIdle();

    extensionCardsList = await page.$$('.extension-card');
    expect(extensionCardsList.length).toBe(8);
  });

  it('Checks that the card is removed from display when api call is successful', async () => {
    const extensionCards = await page.$$('.extension-card');

    for (const card of extensionCards) {
      const titleText = await card.$eval(
        '.title-text',
        (title) => title.textContent,
      );

      if (titleText.includes('A new title')) {
        const approveButton = await card.$('.approve-button');
        await approveButton.click();
        break;
      }
    }
    await page.waitForTimeout(850);

    const extensionCardsAfter = await page.$$('.extension-card');

    expect(extensionCardsAfter.length).toBe(3);
  });

  it('Checks whether the card is not removed from display when api call is unsuccessful', async () => {
    const extensionCards = await page.$$('.extension-card');

    for (const card of extensionCards) {
      const titleText = await card.$eval(
        '.title-text',
        (title) => title.textContent,
      );

      if (titleText.includes('A title')) {
        const approveButton = await card.$('.approve-button');
        await approveButton.click();
        break;
      }
    }
    await page.waitForTimeout(850);

    const extensionCardsAfter = await page.$$('.extension-card');

    expect(extensionCardsAfter.length).toBe(4);
  });

  it('Checks whether the timestamp are sorted', async () => {
    const extensionCards = await page.$$('.extension-card');

    const requestDaysArray = [];
    for (const card of extensionCards) {
      const requestedDays = await card.$eval(
        '.requested-day',
        (requestDays) => requestDays.textContent,
      );
      requestDaysArray.push(requestedDays);
    }
    const sortedRequestDaysArray = [...requestDaysArray].sort().reverse();

    expect(requestDaysArray).toEqual(sortedRequestDaysArray);
  });

  it('Checks whether the cards displayed in descending order when sort icon is clicked', async () => {
    const sortButton = await page.$('.sort-button');

    await sortButton.click();

    const extensionCards = await page.$$('.extension-card');

    const requestDaysArray = [];
    for (const card of extensionCards) {
      const requestedDays = await card.$eval(
        '.requested-day',
        (requestDays) => requestDays.textContent,
      );
      requestDaysArray.push(requestedDays);
    }

    const sortedRequestDaysArray = [...requestDaysArray].sort();

    expect(requestDaysArray).toEqual(sortedRequestDaysArray);
  });
});
