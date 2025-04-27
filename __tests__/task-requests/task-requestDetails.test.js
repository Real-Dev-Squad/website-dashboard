const puppeteer = require('puppeteer');
const {
  urlMappings,
  defaultMockResponseHeaders,
} = require('../../mock-data/taskRequests');
const { user } = require('../../mock-data/users/index.js');
const {
  STAGING_API_URL,
  LOCAL_TEST_PAGE_URL,
} = require('../../mock-data/constants');
const { longDescription } = require('../../mock-data/taskRequests/index.js');
describe('Request container for non-super users', () => {
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
      if (url == `${STAGING_API_URL}/users?profile=true`) {
        interceptedRequest.respond({
          ...defaultMockResponseHeaders,
          body: JSON.stringify(user),
        });
      } else if (urlMappings.hasOwnProperty(url)) {
        interceptedRequest.respond({
          ...defaultMockResponseHeaders,
          body: JSON.stringify(urlMappings[url]),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/task-requests/details/?id=dM5wwD9QsiTzi7eG7Oq5&dev=true`,
    );
  });

  afterAll(async () => {
    await browser.close();
  });

  it('Approve and Reject buttons should not render for non-super users', async function () {
    await page.waitForNetworkIdle();
    const approveButton = await page.$('[data-testid="task-approve-button"]');
    const rejectButton = await page.$('[data-testid="task-reject-button"]');
    expect(approveButton).toBeNull();
    expect(rejectButton).toBeNull();
  });

  it('Should render task status for non-super users', async function () {
    await page.waitForNetworkIdle();
    const taskRequestStatus = await page.$(
      '[data-testid="requestors-task-status"]',
    );
    expect(taskRequestStatus).toBeTruthy();
  });
});

describe('Task request details page', () => {
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
      `${LOCAL_TEST_PAGE_URL}/task-requests/details/?id=dM5wwD9QsiTzi7eG7Oq5`,
    );
  });

  afterAll(async () => {
    await browser.close();
  });

  it('Checks the Modal working as expected', async () => {
    await page.waitForNetworkIdle();
    await page.click('.info__more');
    await page.waitForSelector('#requestor_details_modal_content', {
      visible: true,
    });
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
    expect(proposedStartDateValue).toBe('Monday, 30 Oct 2023');

    const proposedEndDateHeading = await page.$eval(
      '[data-modal-end-date-text="proposed-end-date-text"]',
      (element) => element.textContent,
    );
    expect(proposedEndDateHeading).toBe('Proposed Deadline:');

    const proposedEndDateValue = await page.$eval(
      '[data-modal-end-date-value="proposed-end-date-value"]',
      (element) => element.textContent,
    );
    expect(proposedEndDateValue).toBe('Sunday, 5 Nov 2023');

    const descriptionTextHeading = await page.$eval(
      '[data-modal-description-text="proposed-description-text"]',
      (element) => element.textContent,
    );
    expect(descriptionTextHeading).toBe('Description:');

    const descriptionTextValue = await page.$eval(
      '[data-modal-description-value="proposed-description-value"]',
      (element) => element.textContent,
    );
    expect(descriptionTextValue).toBe(longDescription);
  });

  it('Should render Approve and Reject buttons for super users', async function () {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/task-requests/details/?id=dM5wwD9QsiTzi7eG7Oq5&dev=true`,
    );
    await page.waitForNetworkIdle();
    const approveButton = await page.$('[data-testid="task-approve-button"]');
    const rejectButton = await page.$('[data-testid="task-reject-button"]');
    expect(approveButton).toBeTruthy();
    expect(rejectButton).toBeTruthy();
  });

  it('should properly handle long descriptions in the modal', async function () {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/task-requests/details/?id=dM5wwD9QsiTzi7eG7Oq5`,
    );
    await page.waitForNetworkIdle();
    await page.click('.info__more');
    await page.waitForSelector('#requestor_details_modal_content', {
      visible: true,
    });

    const descriptionText = await page.$eval(
      '[data-modal-description-value="proposed-description-value"]',
      (el) => el.textContent.trim(),
    );
    expect(descriptionText.length).toBeGreaterThan(1000);

    const isScrollable = await page.evaluate(() => {
      const modal = document.querySelector('#requestor_details_modal_content');
      return modal.scrollHeight > modal.clientHeight;
    });

    expect(isScrollable).toBe(true);
  });

  it('should render N/A for description if descriptions is not present', async function () {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/task-requests/details/?id=dM5wwD9QsiTzi7eG7Oq7`,
    );
    await page.waitForNetworkIdle();
    await page.click('.info__more');
    await page.waitForSelector('#requestor_details_modal_content', {
      visible: true,
    });

    const descriptionHtmlValue = await page.$eval(
      '[data-modal-description-value="proposed-description-value"]',
      (element) => element.innerHTML,
    );
    expect(descriptionHtmlValue).toContain('N/A');
  });
});

describe('Task request details page with markdown support in description', () => {
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
      `${LOCAL_TEST_PAGE_URL}/task-requests/details/?id=dM5wwD9QsiTzi7eG7Oq6`,
    );
  });

  afterAll(async () => {
    await browser.close();
  });

  it('Checks the Modal working as expected', async () => {
    await page.waitForNetworkIdle();
    await page.click('.info__more');
    await page.waitForSelector('#requestor_details_modal_content', {
      visible: true,
    });
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
    expect(proposedStartDateValue).toBe('Monday, 30 Oct 2023');

    const proposedEndDateHeading = await page.$eval(
      '[data-modal-end-date-text="proposed-end-date-text"]',
      (element) => element.textContent,
    );
    expect(proposedEndDateHeading).toBe('Proposed Deadline:');

    const proposedEndDateValue = await page.$eval(
      '[data-modal-end-date-value="proposed-end-date-value"]',
      (element) => element.textContent,
    );
    expect(proposedEndDateValue).toBe('Sunday, 5 Nov 2023');

    const descriptionTextHeading = await page.$eval(
      '[data-modal-description-text="proposed-description-text"]',
      (element) => element.textContent,
    );
    expect(descriptionTextHeading).toBe('Description:');

    const descriptionHtmlValue = await page.$eval(
      '[data-modal-description-value="proposed-description-value"]',
      (element) => element.innerHTML,
    );
    expect(descriptionHtmlValue).toContain('<h3 id="heading">Heading</h3>');
  });

  it('Should render Approve and Reject buttons for super users', async function () {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/task-requests/details/?id=dM5wwD9QsiTzi7eG7Oq6&dev=true`,
    );
    await page.waitForNetworkIdle();
    const approveButton = await page.$('[data-testid="task-approve-button"]');
    const rejectButton = await page.$('[data-testid="task-reject-button"]');
    expect(approveButton).toBeTruthy();
    expect(rejectButton).toBeTruthy();
  });
});

describe('Task request details page with status creation', () => {
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
      `${LOCAL_TEST_PAGE_URL}/task-requests/details/?id=uC0IUpkFMx393XjnKx4w`,
    );
  });

  afterAll(async () => {
    await browser.close();
  });

  it('Should render github issue', async () => {
    await page.waitForNetworkIdle();

    const issue = await page.$('#task-details');
    const testId = await issue.evaluate((el) => el.innerHTML);

    expect(testId).toContain(
      'When super_user try to update skills of new users the data of',
    );
  });
  it('Should render title of the issue', async () => {
    await page.waitForNetworkIdle();
    const issueTitle = await page.$('#issue_title');
    const title = await issueTitle.evaluate((el) => el.innerHTML);

    expect(title).toBe(
      'Fix: user data is not showing up in memberSkillsUpdateModal',
    );
  });
  it('Should render author and time of the issue', async () => {
    await page.waitForNetworkIdle();
    const issueTimeAndAuthor = await page.$('#issue_time_author');
    const timeAndAuthor = await issueTimeAndAuthor.evaluate(
      (el) => el.innerHTML,
    );

    expect(timeAndAuthor).toContain('Wed Sep 06 2023');
    expect(timeAndAuthor).toContain('anishpawaskar');
  });
  it('Should render assignee of the issue', async () => {
    await page.waitForNetworkIdle();
    const issueAssignee = await page.$('#issue_assignee');
    const assignee = await issueAssignee.evaluate((el) => el.innerHTML);

    expect(assignee).toContain('anishpawaskar');
  });
  it('Should render link of the issue', async () => {
    await page.waitForNetworkIdle();
    const issueLink = await page.$('#issue_link');
    const link = await issueLink.evaluate((el) => el.innerHTML);

    expect(link).toContain(
      'https://github.com/Real-Dev-Squad/members-site/issues/92',
    );
  });

  it.skip('should show success toast after approving the task  request', async function () {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/task-requests/details/?id=dM5wwD9QsiTzi7eG7Oq5&dev=true`,
    );
    await page.waitForNetworkIdle();

    const approveButton = await page.$('[data-testid="task-approve-button"]');

    await approveButton.click();
    const toastComponent = await page.$('[data-testid="toast-component"]');
    expect(
      await toastComponent.evaluate((el) => el.classList.contains('show')),
    ).toBe(true);
    expect(
      await toastComponent.evaluate((el) => el.classList.contains('hide')),
    ).toBe(false);
    expect(
      await toastComponent.evaluate((el) =>
        el.classList.contains('success__toast'),
      ),
    ).toBe(true);
    expect(
      await toastComponent.evaluate((el) =>
        el.classList.contains('error__toast'),
      ),
    ).toBe(false);
    const toastMessage = await page.$('[data-testid="toast-message"]');
    expect(await toastMessage.evaluate((el) => el.textContent)).toBe(
      'Task updated Successfully',
    );
  });
});
