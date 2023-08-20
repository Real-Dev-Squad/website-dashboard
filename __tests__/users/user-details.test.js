const puppeteer = require('puppeteer');
const { allUsersData, filteredUsersData } = require('../../mock-data/users');

describe('Pivot button', () => {
  let browser;
  let page;
  // let pivot
  jest.setTimeout(60000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
      args: ['--disable-web-security'],
      devtools: false,
    });
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url === 'https://api.realdevsquad.com/users?size=100&page=1') {
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
      } else if (url === 'https://api.realdevsquad.com/users?search=randhir') {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(filteredUsersData),
        });
      } else if (url === 'https://api.realdevsquad.com/users/self') {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(filteredUsersData),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto('http://localhost:8000/users/');
    await page.waitForTimeout(60000);
    await page.waitForNetworkIdle();
    // pivot = page.waitForSelector('.Intro')
  });

  afterAll(async () => {
    await browser.close();
  });

  it.skip('check pivot button', async () => {
    // await page.screenshot({ path: 'screenshot.png' });
    const userList = await page.$('#user-list');
    const userCards = await userList.$('li'); // Note the double dollar symbol here

    // Now you can interact with each user card or choose a specific one based on your application's behavior.
    await userCards.click();
    // const pivot = await page.waitForSelector('.Intro')
    // pivot = page.waitForSelector('.Intro')
    // expect(pivot).toBeTruthy();
  });

  it('checks the search functionality to display queried user', async () => {
    await page.type('input[id="user-search"]', 'randhir');
    await page.waitForNetworkIdle();
    const userList = await page.$('#user-list');
    const userCard = await userList.$$('ul');
    // let result = [];
    // for(let t of userCard) {
    //     result.push(await t.evaluate(x => x.textContent));
    // }

    // let result2 = await Promise.all(userCard.map(async (t) => {
    //     return await t.evaluate(x => x.textContent);
    // }))

    // console.log({result : result, result2 : result2});
    // console.log(userCard)
    // console.log(userCard)
    await userCard.click();
    await page.waitForNetworkIdle();
    await page.$('.user-details');
    const det = await page.$('.user-details');
    expect(det).toBeTruthy();
  });

  it.skip('check details page', async () => {
    // await page.goto('http://localhost:8000/users/details/index.html?username=randhir');
    // await page.screenshot({ path: 'screenshot.png' });
    await page.type('input[id="user-search"]', 'randhir');
    await page.waitForNetworkIdle();
    const userList = await page.$('#user-list');
    const userCard = await userList.$$('li');
    await userCard.click();
    await page.waitForNetworkIdle();
    await page.$('.user-details');
    const det = await page.$('.user-details');
    expect(det).toBeTruthy();
  });

  // it.skip('testing', async () => {
  //   pivot = await page.waitForSelector('.Intro')
  //   expect(pivot).toBeTruthy();
  // });

  // check button is present
  // it('check pivot button', async () => {
  //   const pivotButton = await page.$('.Intro');
  //   expect(pivotButton).toBeTruthy();
  // });
});
