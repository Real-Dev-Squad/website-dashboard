const puppeteer = require('puppeteer');

let config = {
  launchOptions: {
    headless: 'new',
    ignoreHTTPSErrors: true,
  },
};

let urls = [
  'https://dashboard.realdevsquad.com/index.html',
  'https://dashboard.realdevsquad.com/profile/index.html',
  'https://dashboard.realdevsquad.com/goal/index.html',
  'https://dashboard.realdevsquad.com/task/index.html',
  'https://dashboard.realdevsquad.com/users/index.html',
  'https://dashboard.realdevsquad.com/users/details/index.html',
  'https://dashboard.realdevsquad.com/taskevents/index.html',
  'https://dashboard.realdevsquad.com/featureflag/index.html',
  'https://dashboard.realdevsquad.com/wallet/index.html',
  'https://dashboard.realdevsquad.com/online-members/online-members.html',
];

const test_footer = async (url, index) => {
  await puppeteer.launch(config.launchOptions).then(async (browser) => {
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    await page.goto(url, { waitUntil: ['load', 'networkidle2'] });
    await page.content();
    page.setDefaultNavigationTimeout(0);
    const footer = await page.$('footer');
    if (footer) {
      // is the text same in footer?
      const footer_text = await page.evaluate(() => {
        const element = document.querySelector('.info-repo');
        return (
          element &&
          element.innerText ===
            'The contents of this website are deployed from this open sourced repo'
        );
      });
      console.log(`✅ footer text:${footer_text}  index:${index}:${url}`);

      if (footer_text) {
        // links inside footer are working or not
        await page.click('.info-repo a', { delay: 2000 });
        console.log(`✅ link works for ${url}`);
      }
    } else {
      console.log(`❌no footer at ${url}`);
    }

    context.close();
  });
};

async function runTest() {
  for (let url of urls) {
    await test_footer(url, urls.indexOf(url));

    if (urls.indexOf(url) === urls.length - 1) {
      process.exit(0);
    }
  }
}

runTest();
