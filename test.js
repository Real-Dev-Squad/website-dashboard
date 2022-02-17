const puppeteer = require('puppeteer');
let config = {
  launchOptions: {
    headless: false,
  },
};

//Test Case:1 - Only Authenticated user are able to create tasks

puppeteer.launch(config.launchOptions).then(async (browser) => {
  const page = await browser.newPage();
  await page.goto('https://dashboard.realdevsquad.com/src/task/index.html');
  await page.type('#title', 'Testing', { delay: 1000 });
  await page.click('#group', { clickCount: 1 });
  await page.click('#submit', { clickCount: 1 });
  await page.waitForTimeout(3000);
  await browser.close();
});
