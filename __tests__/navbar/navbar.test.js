const puppeteer = require('puppeteer');

const baseUrl = 'http://localhost:8000';
describe('Tests the navbar and its components on various pages', () => {
  let browser;
  let page;
  jest.setTimeout(60000);

  const testNavbar = async (navbarPage) => {
    const navbar = await navbarPage.$('#tasksNav');
    expect(navbar).toBeTruthy();

    const rdsLogo = await navbarPage.$('.logo');
    expect(rdsLogo).toBeTruthy();

    const navLinks = await navbarPage.$('.nav-links');
    expect(navLinks).toBeTruthy();
  };

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
      devtools: false,
    });
    page = await browser.newPage();
  });

  beforeEach(async () => {
    await page.goto(`${baseUrl}`);
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('Renders the navbar correctly on the home page', async () => {
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the tasks page', async () => {
    await page.goto(`${baseUrl}/task`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the profile page', async () => {
    await page.goto(`${baseUrl}/profile`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Discord users page', async () => {
    await page.goto(`${baseUrl}/users/discord`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the User Management page', async () => {
    await page.goto(`${baseUrl}/users`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Extension Requests page', async () => {
    await page.goto(`${baseUrl}/extension-requests`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Task Requests page', async () => {
    await page.goto(`${baseUrl}/task-requests`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Online Members page', async () => {
    await page.goto(`${baseUrl}/online-members/online-members.html`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Standup Updates page', async () => {
    await page.goto(`${baseUrl}/standup/index.html`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Identity Service Logs page', async () => {
    await page.goto(`${baseUrl}/identity-service-logs/index.html`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Requests page', async () => {
    await page.goto(`${baseUrl}/requests/index.html`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Activity Feed page', async () => {
    await page.goto(`${baseUrl}/feed/index.html`);
    await testNavbar(page);
  });
});
