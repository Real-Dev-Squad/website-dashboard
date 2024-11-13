const puppeteer = require('puppeteer');
const { userDetails } = require('../../mock-data/user-details/index');

const API_BASE_URL = 'https://staging-api.realdevsquad.com';

describe('Intro User Button Users Detail Page', () => {
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
      if (url === `${API_BASE_URL}/users/randhir`) {
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
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto(
      'http://localhost:8000/users/details/index.html?username=randhir',
    );
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should render the button', async () => {
    const pivotButton = await page.$('.Intro');
    expect(pivotButton).toBeTruthy();
  });

  it('should show tooltip on button hover for non-superusers', async () => {
    const button = await page.$('.disabled');
    expect(button).toBeTruthy();

    await button.hover();
    await page.waitForTimeout(500);

    const tooltipElement = await page.$('.tooltip');
    expect(tooltipElement).toBeTruthy();

    const tooltipText = await tooltipElement.evaluate(
      (tooltip) => tooltip.textContent,
    );
    expect(tooltipText).toContain(
      'You do not have required permissions to view this.',
    );

    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);

    const updatedTooltipElement = await page.$('.tooltip');
    expect(updatedTooltipElement).toBeFalsy();
  });
});
