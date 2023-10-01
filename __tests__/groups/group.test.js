const puppeteer = require('puppeteer');
const { allUsersData } = require('../../mock-data/users');
const { discordGroups, GroupRoleData } = require('../../mock-data/groups');

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
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto('http://localhost:8000/groups');
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

  test('Should show add button as user not part of the group', async () => {
    await page.goto('http://localhost:8000/groups/?dev=true');
    await page.waitForNetworkIdle();

    const group = await page.$('.group-role');
    await group.click();

    // Wait for the btn-add-role and click it
    const addRoleBtn = await page.$('.btn-add-role');
    await addRoleBtn.click();

    // Now, check the text content of the button
    const buttonText = await addRoleBtn.evaluate((node) => node.textContent);
    expect(buttonText).toBe('Add me to this group');
  });

  test('Should show remove button as user is part of the group', async () => {
    await page.$$eval('.group-role', (elements) => {
      elements[1].click();
    });
    // Wait for the btn-add-role and click it
    const addRoleBtn = await page.$('.btn-add-role');
    await addRoleBtn.click();

    // Now, check the text content of the button
    const buttonText = await addRoleBtn.evaluate((node) => node.textContent);
    expect(buttonText).toBe('Remove me from this group');
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
      expect.arrayContaining(['DSA', 'DSA-Coding-Group']),
    );
  });

  test('should display a message no results found if group not exists', async () => {
    const searchInput = await page.$('#search-groups');

    await searchInput.type('dummy');

    await page.waitForNetworkIdle();

    const noResultFoundHeading = await page.$('#no-results-message');
    const noResultFoundHeadingText = await (
      await noResultFoundHeading.getProperty('innerText')
    ).jsonValue();

    expect(noResultFoundHeadingText).toEqual('No results found.');
  });

  test('should not have group keyword in group list', async () => {
    const renderedGroupNames = await page.$$eval('.group-name', (elements) => {
      return elements.map((element) => element.innerText);
    });
    renderedGroupNames.forEach((groupName) =>
      expect(/^group.*/.test(groupName)).toBe(false),
    );
  });

  test('should show count beside groupname', async () => {
    const memberCounts = await page.$$eval('.group-name', (elements) => {
      return elements.map((element) =>
        element.getAttribute('data-member-count'),
      );
    });
    expect(memberCounts).toEqual(['3', '200', '0']);
  });

  test("should show proper group creator's image", async () => {
    const creatorImageSrcAndAltText = await page.$$eval(
      '.created-by--avatar',
      (elements) => {
        return elements.map((element) => [
          element.getAttribute('src'),
          element.getAttribute('alt'),
        ]);
      },
    );
    const expectedImageSrcAndAltText = discordGroups.groups.map((group) => [
      group.image,
      "group's creator image",
    ]);
    expect(creatorImageSrcAndAltText).toEqual(expectedImageSrcAndAltText);
  });

  test("should show proper group creator's name", async () => {
    const createdByLines = await page.$$eval('.created-by', (elements) => {
      return elements.map((element) => element.innerText);
    });
    const expectedCreatedByLines = discordGroups.groups.map(
      (group) => `created by ${group.firstName} ${group.lastName}`,
    );
    expect(expectedCreatedByLines).toEqual(createdByLines);
  });

  test('should update the URL when input field has changed', async () => {
    manageGroup = await page.$('.manage-groups-tab');
    await manageGroup.click();
    const searchInput = await page.$('#search-groups');
    await searchInput.type('DSA');
    await new Promise((resolve) => setTimeout(resolve, 1000)); //wait for debouncer
    const url = await page.url();
    const searchParams = decodeURIComponent(url.split('?')[1]);
    expect(searchParams).toMatch('DSA');
  });

  test('should update input field and filter group list with search value in URL', async () => {
    await page.goto('http://localhost:8000/groups/?dev=true&DSA');
    manageGroup = await page.$('.manage-groups-tab');
    await manageGroup.click();
    const searchInput = await page.$('#search-groups');
    const inputValue = await page.evaluate(
      (element) => element.value,
      searchInput,
    );
    expect(inputValue).toMatch('DSA');

    const filteredGroupNames = await page.$$eval('.group-role', (elements) => {
      return elements
        .map((element) => element.querySelector('.group-name').textContent)
        .filter((name) => name.includes('DSA'));
    });

    expect(filteredGroupNames).toEqual(
      expect.arrayContaining(['DSA', 'DSA-Coding-Group']),
    );
  });
});
