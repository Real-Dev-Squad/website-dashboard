const puppeteer = require('puppeteer');
const { userDetails , selfdata} = require('../../mock-data/user-details/index');
const {detail} = require('../../mock-data/user-details/details_page');

describe('Tests', () => {
  let browser;
  let page;
  jest.setTimeout(600000);

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
      if (url === 'https://api.realdevsquad.com/users/randhir') {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(userDetails),
        });
      }else if (url === 'https://api.realdevsquad.com/users/self') {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(selfdata),
        });
      }else {
        interceptedRequest.continue();
      }
    });
    await page.goto('http://localhost:8000/users/details/index.html?username=randhir');
    // const baseUrl = 'http://localhost:8000/users/details/index.html';
    // const queryParams = {
    //     username: "randhir"
    // };
    // const urlWithQuery = new URL(baseUrl);
    // Object.keys(queryParams).forEach(key => urlWithQuery.searchParams.append(key, queryParams[key]));

    // await page.goto(urlWithQuery.toString());    
    await page.waitForNetworkIdle();
    await page.waitForTimeout(200000);

  });

  afterAll(async () => {
    await browser.close();
  });

  it('should create a disabled button for non-superusers', async () => {
    // Mock checkUserIsSuperUser function to return false
    await page.evaluate(() => {
      window.checkUserIsSuperUser = async () => false;
    });

    // Ensure the button is created
    const button = await page.$('.disabled');
    expect(button).toBeTruthy();

    // Check if the button has the tooltip
    const tooltip = await page.$('.tooltip');
    expect(tooltip).toBeTruthy();

    // Trigger a mouseover event to reveal the tooltip
    await button.hover();

    // Wait for a short duration to ensure the tooltip is displayed
    await page.waitForTimeout(500);

    // Check if the tooltip text matches
    const tooltipText = await page.evaluate(
      (tooltip) => tooltip.textContent,
      tooltip
    );
    expect(tooltipText).toContain('You do not have required permissions to view this.');
  });

  it('should create an enabled button for superusers', async () => {
    // Mock checkUserIsSuperUser function to return true
    await page.evaluate(() => {
      window.checkUserIsSuperUser = async () => true;
    });

    // Ensure the button is created
    const button = await page.$('a:not(.disabled)');
    expect(button).toBeTruthy();

    // Check if the button does not have the tooltip
    const tooltip = await page.$('.tooltip');
    expect(tooltip).toBeFalsy();
  });

  it('checks the button', async () => {
    const pivot = await page.$('.Intro');
    // await page.waitForSelector(ulSelector, { visible: true, timeout: 10000 });
    // await page.waitForNavigation({ url: 'http://localhost:8080/users/details/index.html?username=randhir'});
    // Optional: Wait for some time to see the effect (for demonstration purposes)
    await page.waitForTimeout(20000);
  });
});