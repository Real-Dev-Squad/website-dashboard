const puppeteer = require('puppeteer');
let config = {
  launchOptions: {
    headless: 'new',
  },
};
puppeteer.launch(config.launchOptions).then(async (browser) => {
  const page = await browser.newPage();
  await page.goto('https://dashboard.realdevsquad.com/goal/index.html');

  const editButtons = await page.$$('.edit-button');

  await page.type('#title', 'Complete the task', { delay: 200 });

  await editButtons[0].click({ delay: 1000 });
  await page.type('#task-name', 'Fix the bug', { delay: 200 });

  await editButtons[1].click({ delay: 1000 });
  await page.type(
    '#links',
    'https://github.com/realdevsquad/website-backend/issues/12',
    { delay: 200 },
  );
  await editButtons[2].click({ delay: 1000 });
  await page.select('#user-role', 'DEVELOPER');

  await editButtons[3].click({ delay: 1000 });
  await page.type('#username', 'ritik', { delay: 200 });

  await editButtons[4].click({ delay: 1000 });
  await page.select('#priority', 'HIGH');

  await editButtons[5].click({ delay: 1000 });
  await page.type('#type', 'BUG', { delay: 200 });

  await editButtons[6].click({ delay: 1000 });
  await page.type('#due-date', '02/20/2023', { delay: 200 });

  await editButtons[7].click({ delay: 1000 });
  await page.type('#assignee', 'ankush', { delay: 200 });

  await page.click('#submit', { delay: 1000 });

  await browser.close();
});
