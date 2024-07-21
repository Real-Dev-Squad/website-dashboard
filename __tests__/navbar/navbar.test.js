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
});
