const puppeteer = require('puppeteer');
const {
  urlMappings,
  defaultMockResponseHeaders,
} = require('../../mock-data/taskRequests');

describe('Tests the User Management User Listing Screen', () => {
  let browser;
  let page;
  jest.setTimeout(60000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
      devtools: false,
    });
    page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (urlMappings.hasOwnProperty(url)) {
        interceptedRequest.respond({
          ...defaultMockResponseHeaders,
          body: JSON.stringify(urlMappings[url]),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto(
      'http://localhost:8000/taskRequests/details/?id=dM5wwD9QsiTzi7eG7Oq5',
    );
    await page.waitForNetworkIdle();
    await page.click('.requestors__container__list__userDetails');
    await page.waitForSelector('#requestor_details_modal', { visible: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('Checks the Modal working as expected', async () => {
    const modalHeading = await page.$eval(
      '[data-modal-header="requestor-details-header"]',
      (element) => element.textContent,
    );
    expect(modalHeading).toBe('Requestor Details');

    const proposedStartDateHeading = await page.$eval(
      '[data-modal-start-date-text="proposed-start-date-text"]',
      (element) => element.textContent,
    );
    expect(proposedStartDateHeading).toBe('Proposed Start Date:');

    const proposedStartDateValue = await page.$eval(
      '[data-modal-start-date-value="proposed-start-date-value"]',
      (element) => element.textContent,
    );
    expect(proposedStartDateValue).toBe('30-10-2023');

    const proposedEndDateHeading = await page.$eval(
      '[data-modal-end-date-text="proposed-end-date-text"]',
      (element) => element.textContent,
    );
    expect(proposedEndDateHeading).toBe('Proposed Deadline:');

    const proposedEndDateValue = await page.$eval(
      '[data-modal-end-date-value="proposed-end-date-value"]',
      (element) => element.textContent,
    );
    expect(proposedEndDateValue).toBe('5-11-2023');

    const descriptionTextHeading = await page.$eval(
      '[data-modal-description-text="proposed-description-text"]',
      (element) => element.textContent,
    );
    expect(descriptionTextHeading).toBe('Description:');

    const descriptionTextValue = await page.$eval(
      '[data-modal-description-value="proposed-description-value"]',
      (element) => element.textContent,
    );
    expect(descriptionTextValue).toBe(
      'code change 3 days , testing - 2 days. total - 5 days',
    );
  });
});
