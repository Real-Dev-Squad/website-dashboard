const puppeteer = require('puppeteer');
let config = {
  launchOptions: {
    headless: false,
  },
};

const test_footer = (url) => {
  puppeteer.launch(config.launchOptions).then(async (browser) => {
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    // await page.goto('https://dashboard.realdevsquad.com/index.html');
    await page.goto(url);
    await page.content();
    const footer = await page.$('footer');
    // if footer exists
    if (footer) {
      // the text is same
      const footer_para = await page.evaluate(() => {
        const element = document.querySelector('.info-repo');
        console.log(element);

        return (
          element &&
          element.innerText ===
            'The contents of this website are deployed from this open sourced repo'
        );
        // will return undefined if the element is not found
      });
      console.log(`footer text :${footer_para}`);
    } else {
      console.log('no footer');
    }

    await Promise.all([
      page.click('.info-repo a', { delay: 2000 }),
      page.waitForNavigation(),
    ]).catch((e) => console.log(e));

    await context.close();
  });
};

test_footer('https://dashboard.realdevsquad.com/index.html');
