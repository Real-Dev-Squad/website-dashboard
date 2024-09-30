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
        } else if (url === `${BASE_URL}/discord-actions/groups`) {
          interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify(discordGroups),
          });
        } else if (url === `${BASE_URL}/discord-actions/groups?dev=true`) {
          interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify(discordGroups),
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
          // discordGroups.push(groupData);
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
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Page title should be "Discord Groups"', async () => {
    const pageTitle = await page.title();
    expect(pageTitle).toBe('Discord Groups | Real Dev Squad');
  });

  test('Should display cards', async () => {
    await page.waitForSelector('.card');
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
    const groupCreationModalClosed = await page.$('.group-creation-modal');

    expect(groupCreationModalClosed).toBeFalsy();
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

    expect(displayedGroups).toEqual(['First Daaa', 'DSA Coding Group']);
  });

  test('Should display no group found div when no group is present', async () => {
    await page.goto(`${PAGE_URL}/groups?dev=true&name=no-group-present`);
    await page.waitForNetworkIdle();

    const noGroupDiv = await page.$('.no-group-container');

    expect(noGroupDiv).toBeTruthy();
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
