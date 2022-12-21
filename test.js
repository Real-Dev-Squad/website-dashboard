const puppeteer = require('puppeteer');

// Function for testing responsiveness of ".buttonSection"
function test_btn(width, height, expected_display, test_no) {
  puppeteer.launch({ headless: true }).then(async (browser) => {
    const page = await browser.newPage();

    await page.setViewport({
      width,
      height,
    });

    // for official website
    await page.goto('https://dashboard.realdevsquad.com/');

    // for local environment
    // await page.goto('http:localhost:5500');

    const display = await page.$eval(
      '.buttonSection',
      (el) => getComputedStyle(el).display,
    );

    if (display == expected_display) {
      console.log(`> Test ${test_no} Passed. ✅`);
    } else {
      throw new Error(`> Test ${test_no} Failed. ❌`);
    }

    await browser.close();
  });
}

let config = {
  launchOptions: {
    headless: false,
  },
};
puppeteer.launch(config.launchOptions).then(async (browser) => {
  const page = await browser.newPage();
  await page.goto('https://dashboard.realdevsquad.com/src/task/index.html');
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

// Test Case1: Testing for Desktop width (900x1020)
test_btn(900, 1020, 'flex', 1);

// Test Case2: Testing for Mobile width (IphoneX)
test_btn(414, 896, 'grid', 2);

// Test Case3: Testing for Mobile width (motoG)
test_btn(360, 640, 'grid', 3);

// Test Case3: Testing for Mobile width (Pixel 5)
test_btn(393, 851, 'grid', 4);

// Test Case5: Testing for Mobile width (NestHub max)
test_btn(1280, 800, 'flex', 5);
