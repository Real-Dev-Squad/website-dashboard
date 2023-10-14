const puppeteer = require('puppeteer');
const API_BASE_URL = 'https://staging-api.realdevsquad.com';
const { allUsersData } = require('../../mock-data/users');

describe('Task Page - Assignee Profile Pic', () => {
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

      if (url === `${API_BASE_URL}/users`) {
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
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto('http://localhost:8000/task/');
    await page.waitForNetworkIdle();

    // Click the button and select the status as Assigned
    const buttonId = 'statusId';
    const button = await page.$(`#${buttonId}`);
    await button.click();
    await page.waitForSelector('select.input:not(.notEditing)');
    await page.select('select#status', 'ASSIGNED');
  });

  afterAll(async () => {
    await browser.close();
  });

  it('Profile picture with url', async () => {
    const inputElement = await page.$('input#assignee');
    const name = 'Arpit_02';

    //Trigger the input event manually
    for (let i = 0; i < name.length; i++) {
      await inputElement.type(name[i], { delay: 100 });
    }

    await page.waitForSelector('#suggested-users-container');

    await page.waitForTimeout(2000);
    const imgSrc = await page.$eval('#list-items img', (img) => img.src);
    const expectedImageFilename =
      'https://res.cloudinary.com/realdevsquad/image/upload/v1679878917/profile/54vObOfoscwiIVNMSqnN/askdcanhcehukqrdugge.jpg';
    expect(imgSrc.endsWith(expectedImageFilename)).toBe(true);
  });

  it('Profile picture without url - default No-profile-pic.jpg to be loaded', async () => {
    //Remove the value entered in previous test case
    const inputElement = await page.$('input#assignee');
    await inputElement.click({ clickCount: 3 }); // Select all text
    await page.keyboard.press('Backspace');
    await new Promise((resolve) => setTimeout(resolve, 500));

    const name = '19sriram';
    for (let i = 0; i < name.length; i++) {
      await inputElement.type(name[i], { delay: 100 });
    }

    await page.waitForSelector('#suggested-users-container');
    await page.waitForTimeout(2000);

    const imgSrc = await page.$eval('#list-items img', (img) => img.src);
    const expectedImageFilename = 'No-profile-pic.jpg';
    expect(imgSrc.endsWith(expectedImageFilename)).toBe(true);
  });
});
