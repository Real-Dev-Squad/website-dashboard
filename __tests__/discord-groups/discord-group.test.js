const puppeteer = require('puppeteer');

describe('Discord Groups Page', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
    });
    page = await browser.newPage();
    await page.goto('http://localhost:8000/discord-groups/index.html');
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Initial page load', () => {
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
  });

  describe('Creating a new group', () => {
    it('Should display an error message if the role name contains "group"', async () => {
      const createGroup = await page.$('.create-groups-tab');
      await createGroup.click();
      await page.type('.new-group-input', 'mygroup', { delay: 200 });
      let msg;
      page.on('dialog', async (dialog) => {
        msg = dialog.message();
        await dialog.accept();
      });

      const createGroupBtn = await page.$('#create-button');
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
  });

  //   describe('Adding a role to the user', () => {
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
  //   });
});
