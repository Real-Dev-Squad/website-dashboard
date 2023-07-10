const puppeteer = require('puppeteer');
const { allUsersData } = require('../../mock-data/users');
const { API_BASE_URL } = require('../../constants');
const { discordGroups } = require('../../mock-data/discord-groups');

const BASE_URL = 'https://api.realdevsquad.com';

describe('Discord Groups Page', () => {
  let browser;
  let page;
  let createGroup;
  let createGroupBtn;
  let alertMessage;
  jest.setTimeout(60000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
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
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto('http://localhost:8000/discord-groups');
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Page title should be "Discord Groups"', async () => {
    const pageTitle = await page.title();
    expect(pageTitle).toBe('Discord Groups | Real Dev Squad');
  });

  test('Add role button should be disabled for unverified users', async () => {
    const isButtonDisabled = await page.$eval(
      '.btn-add-role',
      (button) => button.disabled,
    );
    expect(isButtonDisabled).toBe(true);
  });

  test('User not verified message should be visible for unverified users', async () => {
    const isMessageVisible = await page.$eval(
      '.not-verified-tag',
      (message) => !message.classList.contains('hidden'),
    );
    expect(isMessageVisible).toBe(false);
  });

  test('Group list should contain the correct number of items', async () => {
    const groupListLength = await page.$$eval(
      '.group-role',
      (list) => list.length,
    );
    expect(groupListLength).toBe(3);
  });

  test('Should not display an error message if the role name contains "group"', async () => {
    createGroup = await page.$('.create-groups-tab');
    await createGroup.click();
    await page.type('.new-group-input', 'demo-role');

    createGroupBtn = await page.$('#create-button');
    await createGroupBtn.click();

    await page.waitForNetworkIdle();
    await expect(alertMessage).toContain('Group created successfully');
  });
  test('Should show role added', async () => {
    groupRole = await page.$('.group-role');
    await groupRole.click();

    addRoleBtn = await page.$('.btn-add-role');
    await addRoleBtn.click();

    await page.waitForNetworkIdle();
    await expect(alertMessage).toContain('Role created successfully');
  });
  test('Should display an error message if the role name contains "group"', async () => {
    createGroup = await page.$('.create-groups-tab');
    await createGroup.click();
    await page.type('.new-group-input', 'mygroup');
    createGroupBtn = await page.$('#create-button');
    await createGroupBtn.click();
    await expect(alertMessage).toContain("Roles cannot contain 'group'.");
  });

  test('Filter groups based on search input', async () => {
    const searchInput = await page.$('#search-groups');
    await searchInput.type('DSA');

    const filteredGroupNames = await page.$$eval('.group-role', (elements) => {
      return elements
        .map((element) => element.querySelector('.group-name').textContent)
        .filter((name) => name.includes('DSA'));
    });

    expect(filteredGroupNames).toEqual(
      expect.arrayContaining(['group-DSA', 'group-DSA-Coding-Group']),
    );
  });

  test('should update the URL when a group role is clicked', async () => {
    await page.$$eval('.group-role', (elements) => {
      elements[1].click();
    });
    const url = await page.url();
    const decodedParams = decodeURIComponent(url.split('?')[1]);
    console.log(decodedParams);
    expect(decodedParams).toMatch('group-DSA');
  });
});
