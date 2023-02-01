const puppeteer = require('puppeteer');
let config = {
  launchOptions: {
    headless: true,
  },
};
puppeteer.launch(config.launchOptions).then(async (browser) => {
  const page = await browser.newPage();
  await page.goto('https://dashboard.realdevsquad.com/task/');
  //Test Case:1 - Only Authenticated user are able to create tasks
  await page.type('#title', 'Testing', { delay: 200 });
  await page.waitForSelector('#group');
  await page.click('#group');
  await page.on('dialog', async (dialog) => {
    await page.waitForTimeout(1000);
    await dialog.accept();
  });
  await page.waitForSelector('#submit');
  await page.click('#submit');
  await page.waitForTimeout(4000);
  //Test Case:2 - Change status to Assigned. Submit without filling assignee
  await page.waitForSelector('#statusId');
  await page.click('#statusId');
  await page.waitForTimeout(2000);
  await page.waitForSelector('#status');
  await page.click('#status');
  await page.select('#status', 'ASSIGNED');
  await page.waitForSelector('#status');
  await page.click('#status');
  await page.waitForSelector('#submit');
  await page.click('#submit');
  await page.waitForTimeout(3000);
  //Test Case:3 - Change status to Assigned. Submit filling assignee
  await page.waitForSelector('#feature');
  await page.click('#feature');
  await page.waitForSelector('#assignee');
  await page.type('#assignee', 'iamashusahoo', { delay: 200 });
  await page.waitForSelector('#title');
  await page.type('#title', 'Assignee', { delay: 200 });
  await page.click('#list-items .list-item');
  await page.waitForSelector('#submit');
  await page.click('#submit');
  await page.waitForTimeout(3000);
  await browser.close();
});
