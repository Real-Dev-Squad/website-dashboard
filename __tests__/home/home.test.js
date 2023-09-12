const puppeteer = require('puppeteer');
const { superUserData } = require('../../mock-data/users');

describe('Home Page', () => {
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
      if (url === `https://api.realdevsquad.com/users/self`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(superUserData),
        });
      } else if (
        url ===
        `https://api.realdevsquad.com/discord-actions/nicknames/sync?dev=true`
      ) {
        interceptedRequest.respond({
          status: 200,
          ok: true,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify({
            numberOfUsersEffected: 5,
            message: 'Users Nicknames updated successfully',
          }),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto('http://localhost:8000/');
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should display the Sync Users Status button', async () => {
    const syncUsersStatusButton = await page.$('#sync-users-status');
    expect(syncUsersStatusButton).toBeTruthy();

    const spinnerInsideSyncUsersStatus = await syncUsersStatusButton.$(
      '.spinner',
    );
    expect(spinnerInsideSyncUsersStatus).toBeTruthy();

    const syncUsersStatusUpdate = await page.$('#sync-users-status-update');
    expect(syncUsersStatusUpdate).toBeTruthy();
  });

  it('should display the Sync External Accounts button', async () => {
    const syncExternalAccountsButton = await page.$('#sync-external-accounts');
    expect(syncExternalAccountsButton).toBeTruthy();

    const spinnerInsideSyncExternalAccounts =
      await syncExternalAccountsButton.$('.spinner');
    expect(spinnerInsideSyncExternalAccounts).toBeTruthy();

    const syncExternalAccountsUpdate = await page.$(
      '#sync-external-accounts-update',
    );
    expect(syncExternalAccountsUpdate).toBeTruthy();
  });

  it('should call the right api endpoint when Sync External Accounts button is clicked', async () => {
    let isRightUrlCalled = false;
    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      const httpMethod = interceptedRequest.method();
      if (
        url ===
          'https://api.realdevsquad.com/external-accounts/users?action=discord-users-sync' &&
        httpMethod === 'POST'
      ) {
        isRightUrlCalled = true;
      }
    });
    const syncExternalAccountsButton = await page.$('#sync-external-accounts');
    await syncExternalAccountsButton.click();
    await page.waitForNetworkIdle();
    expect(isRightUrlCalled).toBe(true);
  });

  it('should display the Sync Unverified Users button', async () => {
    const syncUnverifiedUsersButton = await page.$('#sync-unverified-users');
    expect(syncUnverifiedUsersButton).toBeTruthy();

    const spinnerInsideSyncUnverifiedUsers = await syncUnverifiedUsersButton.$(
      '.spinner',
    );
    expect(spinnerInsideSyncUnverifiedUsers).toBeTruthy();

    const syncUnverifiedUsersUpdate = await page.$(
      '#sync-unverified-users-update',
    );
    expect(syncUnverifiedUsersUpdate).toBeTruthy();
  });
  it('should display the Sync Users nicknames button', async () => {
    const syncNicknamesButton = await page.$('#sync-nicknames');
    expect(syncNicknamesButton).toBeTruthy();

    const spinnerInsideSyncNicknamesButton = await syncNicknamesButton.$(
      '.spinner',
    );
    expect(spinnerInsideSyncNicknamesButton).toBeTruthy();

    const syncNicknamesUpdate = await page.$('#sync-nicknames-status-update');
    expect(syncNicknamesUpdate).toBeTruthy();
  });

  it('should display the latest sync date when a super_user clicks on the Sync Users nicknames button', async () => {
    await page.evaluate(() => {
      document.querySelector('#sync-nicknames').click();
    });
    await page.waitForNetworkIdle();

    const latestSyncStatusElement = await page.waitForSelector(
      '#sync-nicknames-status-update',
    );

    expect(latestSyncStatusElement).toBeTruthy();

    const latestSyncStatusText = await page.evaluate(
      (element) => element.textContent,
      latestSyncStatusElement,
    );

    expect(latestSyncStatusText).not.toBe(`Last Sync: Failed`);
    expect(latestSyncStatusText).not.toBe(
      `Last Sync: Synced Data Not Available`,
    );
    expect(latestSyncStatusText).not.toBe(`Last Sync: In progress`);
  });

  it('should display the Create Goals anchor button', async () => {
    const createGoalsButton = await page.$('#create-goal');
    expect(createGoalsButton).toBeTruthy();
  });

  it('should display the Discord Users anchor button', async () => {
    const discordUsersButton = await page.$('#discord-user-link');
    expect(discordUsersButton).toBeTruthy();
    const discordUsersButtonHref = await page.evaluate(
      (el) => el.getAttribute('href'),
      discordUsersButton,
    );
    expect(discordUsersButtonHref).toBe('/users/discord/index.html');
    const discordUsersButtonText = await page.evaluate(
      (el) => el.innerText,
      discordUsersButton,
    );
    const trimmedDiscordUsersButtonText = discordUsersButtonText.trim();
    expect(trimmedDiscordUsersButtonText).toBe('Discord Users');
  });

  it('should display the User Management anchor button', async () => {
    const userManagementButton = await page.$('#user-management-link');
    expect(userManagementButton).toBeTruthy();
    const userManagementButtonHref = await page.evaluate(
      (el) => el.getAttribute('href'),
      userManagementButton,
    );
    expect(userManagementButtonHref).toBe('/users/index.html');
    const userManagementButtonText = await page.evaluate(
      (el) => el.innerText,
      userManagementButton,
    );
    const trimmedUserManagementButtonText = userManagementButtonText.trim();
    expect(trimmedUserManagementButtonText).toBe('User Management');
  });

  it('should display the Sync Repo button', async () => {
    const syncRepoButton = await page.$('#repo-sync-button');
    expect(syncRepoButton).toBeTruthy();

    const spinnerInsideSyncRepo = await syncRepoButton.$('.spinner');
    expect(spinnerInsideSyncRepo).toBeTruthy();

    const syncRepoStatusUpdate = await page.$('#sync-repo-status-update');
    expect(syncRepoStatusUpdate).toBeTruthy();

    const toast = await page.$('#toast');
    expect(toast).toBeTruthy();

    await page.evaluate(() => {
      document.querySelector('#repo-sync-button').click();
    });
    await page.waitForSelector('#toast');
    const toastVisibility = await page.waitForFunction(() => {
      const toast = document.querySelector('#toast');
      const toastStyle = window.getComputedStyle(toast);
      return toastStyle && toastStyle.getPropertyValue('display') !== 'none';
    });
    expect(toastVisibility).toBeTruthy();
  });

  it('should display the footer with the correct repo link', async () => {
    const footer = await page.$('footer');
    expect(footer).toBeTruthy();

    const infoRepo = await footer.$('.info-repo');
    expect(infoRepo).toBeTruthy();

    const repoLink = await infoRepo.$('a');
    expect(repoLink).toBeTruthy();

    const repoLinkHref = await page.evaluate((el) => el.href, repoLink);
    expect(repoLinkHref).toBe(
      'https://github.com/Real-Dev-Squad/website-dashboard',
    );

    const repoLinkTarget = await page.evaluate((el) => el.target, repoLink);
    expect(repoLinkTarget).toBe('_blank');

    const repoLinkRel = await page.evaluate((el) => el.rel, repoLink);
    expect(repoLinkRel).toBe('noopener noreferrer');

    const repoLinkText = await page.evaluate((el) => el.innerText, repoLink);
    expect(repoLinkText).toBe('open sourced repo');

    const repoLinkClass = await page.evaluate((el) => el.className, repoLink);
    expect(repoLinkClass).toBe('');

    const repoLinkStyle = await page.evaluate((el) => el.style, repoLink);
    expect(repoLinkStyle).toBeTruthy();
  });
});
