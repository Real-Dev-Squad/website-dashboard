const puppeteer = require('puppeteer');
const { tags } = require('../../mock-data/tags');
const { levels } = require('../../mock-data/levels');
const { users } = require('../../mock-data/users');
const { STAGING_API_URL } = require('../../mock-data/constants');

describe('Input box', () => {
  let browser;
  let page;
  jest.setTimeout(60000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
    });

    // Mock API response setup
    const interceptAPI = async (page) => {
      await page.setRequestInterception(true);
      page.on('request', (interceptedRequest) => {
        const url = interceptedRequest.url();
        const mockResponses = {
          [`${API_BASE_URL}/levels`]: levels,
          [`${API_BASE_URL}/users`]: users,
          [`${API_BASE_URL}/tags`]: tags,
        };

        if (mockResponses[url]) {
          interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(mockResponses[url]),
          });
        } else {
          interceptedRequest.continue();
        }
      });
    };

    // Open a shared page instance and intercept API for all tests
    page = await browser.newPage();
    await interceptAPI(page);
    await page.goto('http://localhost:8000/task');
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  // Form Presence Tests
  describe('Form Field Presence', () => {
    it('should display the title field', async () => {
      const titleField = await page.$('[data-testid="title"]');
      expect(titleField).toBeTruthy();
    });

    it('should display the status field', async () => {
      const statusField = await page.$('[data-testid="status"]');
      expect(statusField).toBeTruthy();
    });

    it('should display the priority field', async () => {
      const priorityField = await page.$('[data-testid="priority"]');
      expect(priorityField).toBeTruthy();
    });

    it('should display the isNoteworthy checkbox', async () => {
      const noteworthyField = await page.$('[data-testid="isNoteworthy"]');
      expect(noteworthyField).toBeTruthy();
    });

    it('should display the purpose field', async () => {
      const purposeField = await page.$('[data-testid="purpose"]');
      expect(purposeField).toBeTruthy();
    });

    it('should display the dependsOn field', async () => {
      const dependsOnField = await page.$('[data-testid="dependsOn"]');
      expect(dependsOnField).toBeTruthy();
    });
  });

  // Status Field Behavior Tests
  describe('Status Field Behavior', () => {
    beforeEach(async () => {
      await page.goto('http://localhost:8000/task');
      await page.waitForNetworkIdle();
    });

    it('should have default status as "available"', async () => {
      const defaultStatus = await page.$eval(
        '[data-testid="status"] select',
        (el) => el.value,
      );
      expect(defaultStatus).toBe('AVAILABLE');
    });

    it('should show/hide fields based on "status" selection', async () => {
      // Change status to "assigned"
      await page.select('[data-testid="status"] select', 'ASSIGNED');

      const assigneeVisible = await page.$eval(
        '[data-testid="assignee"]',
        (el) => window.getComputedStyle(el).display !== 'none',
      );
      const endsOnVisible = await page.$eval(
        '[data-testid="endsOn"]',
        (el) => window.getComputedStyle(el).display !== 'none',
      );
      expect(assigneeVisible).toBeTruthy();
      expect(endsOnVisible).toBeTruthy();

      // Change status back to "available"
      await page.select('[data-testid="status"] select', 'available');

      const assigneeHidden = await page.$eval(
        '[data-testid="assignee"]',
        (el) => window.getComputedStyle(el).display === 'none',
      );
      const endsOnHidden = await page.$eval(
        '[data-testid="endsOn"]',
        (el) => window.getComputedStyle(el).display === 'none',
      );
      expect(assigneeHidden).toBeTruthy();
      expect(endsOnHidden).toBeTruthy();
    });
  });

  // Dev Mode Tests
  describe('Dev Mode Behavior', () => {
    beforeAll(async () => {
      await page.goto('http://localhost:8000/task?dev=true');
      await page.waitForNetworkIdle();
    });

    it('should hide feature URL field in dev mode', async () => {
      const featureUrlField = await page.$('[data-testid="featureUrl"]');
      const display = await page.$eval(
        '[data-testid="featureUrl"]',
        (el) => window.getComputedStyle(el).display,
      );
      expect(display).toBe('none');
    });

    it('should hide task level field in dev mode', async () => {
      const taskLevelField = await page.$('[data-testid="taskLevel"]');
      const display = await page.$eval(
        '[data-testid="taskLevel"]',
        (el) => window.getComputedStyle(el).display,
      );
      expect(display).toBe('none');
    });

    it('should hide feature/group radio buttons in dev mode', async () => {
      const radioButtons = await page.$('[data-testid="radioButtons"]');
      const display = await page.$eval(
        '[data-testid="radioButtons"]',
        (el) => window.getComputedStyle(el).display,
      );
      expect(display).toBe('none');
    });
    it('should display the dependsOn field in dev mode', async () => {
      const dependsOnField = await page.$('[data-testid="dependsOn"]');
      expect(dependsOnField).toBeTruthy();
    });
  });
});
