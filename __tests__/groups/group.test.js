const puppeteer = require('puppeteer');
const { allUsersData } = require('../../mock-data/users');
const { discordGroups, GroupRoleData } = require('../../mock-data/groups');

const BASE_URL = 'https://api.realdevsquad.com';
const PAGE_URL = 'http://localhost:8000';

describe('Discord Groups Page', () => {
  let browser;
  let page;
  jest.setTimeout(60000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--disable-web-security'],
      devtools: false,
    });
    page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (interceptedRequest.method() === 'GET') {
        if (url === `${BASE_URL}/users/`) {
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
        } else if (url === `${BASE_URL}/users/self`) {
          interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify(allUsersData.users[0]),
          });
        } else if (url.startsWith(`${BASE_URL}/discord-actions/groups`)) {
          const urlParams = new URLSearchParams(url.split('?')[1]);
          const latestDoc = urlParams.get('latestDoc');
          const paginatedGroups = getPaginatedGroups(latestDoc);
          interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify(paginatedGroups),
          });
        } else if (url === `${BASE_URL}/discord-actions/roles`) {
          interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify(GroupRoleData),
          });
        } else {
          interceptedRequest.continue();
        }
      } else if (interceptedRequest.method() === 'POST') {
        if (url === `${BASE_URL}/discord-actions/groups`) {
          const postData = interceptedRequest.postData();
          const groupData = JSON.parse(postData);
          interceptedRequest.respond({
            status: 201,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify({ message: 'Group created successfully' }),
          });
        } else if (url === `${BASE_URL}/discord-actions/roles`) {
          interceptedRequest.respond({
            status: 201,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify({ message: 'Role created successfully' }),
          });
        } else {
          interceptedRequest.continue();
        }
      } else if (interceptedRequest.method() === 'DELETE') {
        if (url === `${BASE_URL}/discord-actions/roles`) {
          interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify({ message: 'Role deleted successfully' }),
          });
        } else {
          interceptedRequest.continue();
        }
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto(`${PAGE_URL}/groups`);
    await page.waitForSelector('.card', { timeout: 5000 }); // Wait for the first batch of cards to load
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Page title should be "Discord Groups"', async () => {
    const pageTitle = await page.title();
    expect(pageTitle).toBe('Discord Groups | Real Dev Squad');
  });

  test('Should display cards', async () => {
    const cards = await page.$$('.card');

    expect(cards.length).toBeGreaterThan(0);
  });

  test('Should display card details', async () => {
    const card = await page.$('.card');
    const groupTitle = await card.$eval('.card__title', (el) => el.textContent);
    const groupDescription = await card.$eval(
      '.card__description',
      (el) => el.textContent,
    );
    const groupCount = await card.$eval('.card__count', (el) => el.textContent);

    expect(groupTitle).toBeTruthy();
    expect(groupDescription).toBeTruthy();
    expect(groupCount).toBeTruthy();
  });

  test('Should display card with a button with text "Add me" or "Remove me"', async () => {
    const card = await page.$('.card');
    const buttonText = await card.$eval('.card__btn', (el) => el.textContent);

    expect(buttonText).toMatch(/Add me|Remove me/);
  });

  test('Should display search bar', async () => {
    const searchEl = await page.$('.search');

    expect(searchEl).toBeTruthy();
  });

  test('Should display group creation button', async () => {
    const createGroupBtn = await page.$('.create-group');

    expect(createGroupBtn).toBeTruthy();
  });

  test('Should display group creation modal on group creation button click', async () => {
    const createGroupBtn = await page.$('.create-group');

    await createGroupBtn.click();
    const groupCreationModal = await page.waitForSelector(
      '.group-creation-modal',
    );

    expect(groupCreationModal).toBeTruthy();
  });

  test('Should display group creation modal with input fields', async () => {
    const groupCreationModal = await page.$('.group-creation-modal');
    const groupTitle = await groupCreationModal.$(
      `.input__field[name="title"]`,
    );
    const groupDescription = await groupCreationModal.$(
      `.input__field[name="description"]`,
    );
    const submitBtn = await groupCreationModal.$('.submit__button');

    expect(groupTitle).toBeTruthy();
    expect(groupDescription).toBeTruthy();
    expect(submitBtn).toBeTruthy();
  });

  test('Should group creation modal have clear button to clear title', async () => {
    const groupCreationModal = await page.$('.group-creation-modal');
    const groupTitle = await groupCreationModal.$(
      `.input__field[name="title"]`,
    );
    const clearBtn = await groupCreationModal.$('#clear-input');

    await groupTitle.type('Test Group');
    await clearBtn.click();

    const titleValue = await groupTitle.evaluate((el) => el.value);

    expect(titleValue).toBe('');
  });

  test('Should display group creation modal with close button', async () => {
    const groupCreationModal = await page.$('.group-creation-modal');
    const closeBtn = await groupCreationModal.$('#close-button');

    expect(closeBtn).toBeTruthy();
  });

  test('Should close group creation modal on close button click', async () => {
    const groupCreationModal = await page.$('.group-creation-modal');
    const closeBtn = await groupCreationModal.$('#close-button');

    await closeBtn.click();
    await page.waitForTimeout(500); // Wait for modal to close
    const groupCreationModalClosed = await page.$('.group-creation-modal');

    expect(groupCreationModalClosed).toBeFalsy();
  });

  test('Should load more groups on scroll', async () => {
    await page.goto(`${PAGE_URL}/groups`);
    await page.waitForSelector('.card', { timeout: 5000 });

    const initialGroupCount = await page.$$eval(
      '.card',
      (cards) => cards.length,
    );

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForFunction(
      (initialCount) => {
        return document.querySelectorAll('.card').length > initialCount;
      },
      {},
      initialGroupCount,
    );

    const newGroupCount = await page.$$eval('.card', (cards) => cards.length);

    expect(newGroupCount).toBeGreaterThan(initialGroupCount);
  });

  test('Should stop loading more groups when all groups are loaded', async () => {
    await page.goto(`${PAGE_URL}/groups`);
    await page.waitForSelector('.card', { timeout: 5000 });

    // Scroll to the bottom multiple times
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1000);
    }

    const finalGroupCount = await page.$$eval('.card', (cards) => cards.length);

    // Scroll one more time
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    const newFinalGroupCount = await page.$$eval(
      '.card',
      (cards) => cards.length,
    );

    expect(newFinalGroupCount).toBe(finalGroupCount);
  });

  test('Should display only specified groups when dev=true and name=<group-name> with different case', async () => {
    const groupNames = 'fIrSt,DSA+COdInG';
    await page.goto(`${PAGE_URL}/groups?dev=true&name=${groupNames}`);
    await page.waitForNetworkIdle();

    const displayedGroups = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.card__title')).map(
        (el) => el.textContent,
      );
    });

    expect(displayedGroups).toContain('First Daaa');
    expect(displayedGroups).toContain('DSA Coding Group');
  });

  test('Should display no group found div when no group is present', async () => {
    await page.goto(`${PAGE_URL}/groups?dev=true&name=no-group-present`);
    await page.waitForSelector('.no-group-container', { timeout: 5000 });

    const noGroupDiv = await page.$('.no-group-container');
    expect(noGroupDiv).toBeTruthy();
  });
});

// Helper function to simulate paginated data
function getPaginatedGroups(latestDoc) {
  const pageSize = 18;
  const startIndex = latestDoc
    ? discordGroups.groups.findIndex((g) => g.id === latestDoc) + 1
    : 0;
  const endIndex = startIndex + pageSize;
  const groups = discordGroups.groups.slice(startIndex, endIndex);
  const newLatestDoc = groups.length > 0 ? groups[groups.length - 1].id : null;

  return {
    message: 'Roles fetched successfully!',
    groups,
    newLatestDoc,
  };
}
