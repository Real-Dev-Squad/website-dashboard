const puppeteer = require('puppeteer');

let config = {
  launchOptions: {
    headless: false,
    ignoreHTTPSErrors: true,
  },
};

let urls = [
  'https://dashboard.realdevsquad.com/index.html',
  'https://dev.realdevsquad.com/profile/index.html',
  'https://dev.realdevsquad.com/goal/index.html',
  'https://dev.realdevsquad.com/task/index.html',
  'https://dev.realdevsquad.com/users/index.html',
  'https://dev.realdevsquad.com/users/details/index.html',
  'https://dev.realdevsquad.com/taskevents/index.html',
  'https://dev.realdevsquad.com/featureflag/index.html',
  'https://dev.realdevsquad.com/wallet/index.html',
  'https://dev.realdevsquad.com/online-members/online-members.html',
];

const test_footer = async (url, index) => {
  await puppeteer.launch(config.launchOptions).then(async (browser) => {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: ['load', 'networkidle2'] });
    await page.content();
    page.setDefaultNavigationTimeout(0);
    const footer = await page.$('footer');
    // if footer exists
    if (footer) {
      // is the text same in footer?
      const footer_text = await page.evaluate(() => {
        const element = document.querySelector('.info-repo');
        console.log(element);

        return (
          element &&
          element.innerText ===
            'The contents of this website are deployed from this open sourced repo'
        );
        // will return undefined if the element is not found
      });
      console.log(`✅ footer text:${footer_text}  index:${index}:${url}`);

      if (footer_text) {
        // links inside footer are working or not
        await Promise.all([
          page.click('.info-repo a', { delay: 2000 }),
          page.waitForNavigation(),
          setTimeout(() => {
            console.log(`✅ link works for ${url}`);
            browser.close();
          }, 10000),
        ]).catch((e) => console.log('disconnected '));
      }
    } else {
      console.log(`no footer at ${url}`);
    }
  });
};

async function runTest() {
  for (let url of urls) {
    console.log(urls.indexOf(url));
    await test_footer(url, urls.indexOf(url));
  }
}

runTest();
