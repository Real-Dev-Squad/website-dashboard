const puppeteer = require('puppeteer');
const { allUsersData } = require('../../mock-data/users');
const { API_BASE_URL } = require('../../constants');
const { discordGroups } = require('../../mock-data/discord-groups');

const BASE_URL = 'http://localhost:3000';

describe('Discord Groups Page', () => {
  let browser;
  let page;
  let createGroup;
  let createGroupBtn;
  jest.setTimeout(60000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
      args: ['--disable-web-security'],
      devtools: true,
    });
    page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      console.log(url);
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
          body: JSON.stringify(allUsersData[0]),
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
    });
    await page.goto('http://localhost:8000/discord-groups');
    await page.waitForNetworkIdle();
    createGroup = await page.$('.create-groups-tab');
    createGroupBtn = await page.$('#create-button');
  });

  afterAll(async () => {
    // await browser.close();
  });

  test('Page title should be "Discord Groups"', async () => {
    const pageTitle = await page.title();
    expect(pageTitle).toBe('Discord Groups | Real Dev Squad');
  });

  test('Create group button should be disabled for unverified users', async () => {
    const isButtonDisabled = await page.$eval(
      '.btn-create-group',
      (button) => button.disabled,
    );
    expect(isButtonDisabled).toBe(false);
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
    expect(groupListLength).toBe(0);
  });

  test.only('Should display an error message if the role name contains "group"', async () => {
    await createGroup.click();
    await page.type('.new-group-input', 'mygroup');
    let msg;
    page.on('dialog', async (dialog) => {
      msg = dialog.message();
      await dialog.accept();
    });
    createGroupBtn = await page.$('#create-button');
    await createGroupBtn.click();

    expect(msg).toContain("Roles cannot contain 'group'.");
  });

  //   test('Should display a success message and reload the page on successful group creation', async () => {
  //     page.waitForNavigation();
  //     await page.type('.new-group-input', 'myrole');
  //     await page.click('.btn-create-group');
  //     const alertText = await page.evaluate(() => alert.mock.calls[0][0]);
  //     expect(alertText).toContain('Group created successfully');
  //     await page.waitForNavigation();
  //     const groupListLength = await page.$$eval(
  //       '.group-role',
  //       (list) => list.length,
  //     );
  //     await expect(groupListLength).toBe(3);
  //   });

  //     test('Should display a success message and enable the add role button on successful role addition', async () => {
  //       await page.click('.group-role');
  //       const isButtonEnabled = await page.$eval(
  //         '.btn-add-role',
  //         (button) => !button.disabled,
  //       );
  //       expect(isButtonEnabled).toBe(true);
  //       await page.click('.btn-add-role');
  //       const alertText = await page.evaluate(() => alert.mock.calls[0][0]);
  //       await expect(alertText).toContain('Role added successfully');
  //     });
});
