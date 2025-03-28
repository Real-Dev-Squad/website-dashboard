const puppeteer = require('puppeteer');
const { LOCAL_TEST_PAGE_URL } = require('../../mock-data/constants');

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

    const devFlag = await navbarPage.evaluate(() => {
      return new URLSearchParams(window.location.search).get('dev') === 'true';
    });

    const chevronIcon = await navbarPage.$('#chevron-down');
    if (devFlag) {
      expect(chevronIcon).toBeTruthy();
    } else {
      expect(chevronIcon).toBeFalsy();
    }
  };

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
      devtools: false,
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('Renders the navbar correctly on the home page', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the tasks page', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/task`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the profile page', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/profile`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Discord users page', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/users/discord`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the User Management page', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/users`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Extension Requests page', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/extension-requests`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Task Requests page', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/task-requests`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Online Members page', async () => {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/online-members/online-members.html`,
    );
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Standup Updates page', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/standup/index.html`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Identity Service Logs page', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/identity-service-logs/index.html`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Requests page', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/requests/index.html`);
    await testNavbar(page);
  });

  it('Renders the navbar correctly on the Activity Feed page', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/feed/index.html`);
    await testNavbar(page);
  });
  it('should close the dropdown by clicking outside the dropdown under dev feature flag', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}?dev=true`);

    const userInfoHandle = await page.$('.user-info');
    const dropdownHandle = await page.$('#dropdown');

    expect(userInfoHandle).toBeTruthy();
    expect(dropdownHandle).toBeTruthy();

    await page.evaluate(() => {
      const userInfo = document.querySelector('.user-info');
      if (userInfo) {
        userInfo.click();
      }
    });
    await page.mouse.click(100, 100);
    const dropdownIsActive = await dropdownHandle.evaluate((el) =>
      el.classList.contains('active'),
    );
    expect(dropdownIsActive).toBe(false);
  });
  it('should keep the dropdown open when clicking outside when feature flag is off', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}?dev=false`);
    await page.waitForSelector('#dropdown');
    await page.evaluate(() => {
      const dropdown = document.getElementById('dropdown');
      if (dropdown && !dropdown.classList.contains('active')) {
        dropdown.classList.add('active');
      }
    });
    let dropdownIsActive = await page.evaluate(() => {
      const dropdown = document.getElementById('dropdown');
      return dropdown?.classList.contains('active') ?? false;
    });
    expect(dropdownIsActive).toBe(true);
    await page.evaluate(() => {
      document.body.click();
    });
    await page.waitForTimeout(200);
    const newDropdownHandle = await page.$('#dropdown');
    const newDropdownIsActive = await newDropdownHandle.evaluate((el) =>
      el.classList.contains('active'),
    );
    expect(newDropdownIsActive).toBe(true);
  });
});
