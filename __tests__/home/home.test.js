const puppeteer = require('puppeteer');
const { superUserData } = require('../../mock-data/users');
const {
  STAGING_API_URL,
  LOCAL_TEST_PAGE_URL,
} = require('../../mock-data/constants');

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
      if (url === `${STAGING_API_URL}/users/self`) {
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
      } else if (url === `${STAGING_API_URL}/discord-actions/group-idle-7d`) {
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
            message: 'All Idle 7d+ Users updated successfully.',
            totalArchivedUsers: 1,
            totalGroupIdle7dRolesApplied: {
              count: 3,
              response: [
                { message: 'Role added successfully' },
                { message: 'Role added successfully' },
                { message: 'Role added successfully' },
              ],
            },
            totalGroupIdle7dRolesNotApplied: { count: 0, errors: [] },
            totalGroupIdle7dRolesNotRemoved: { count: 0, errors: [] },
            totalGroupIdle7dRolesRemoved: { count: 0, response: [] },
            totalIdle7dUsers: 4,
            totalUserRoleToBeAdded: 4,
            totalUserRoleToBeRemoved: 0,
            totalUsersHavingNoDiscordId: 0,
          }),
        });
      } else if (
        url === `${STAGING_API_URL}/discord-actions/nicknames/sync?dev=true`
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
      } else if (
        url === `${STAGING_API_URL}/discord-actions/group-onboarding-31d-plus`
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
            message:
              'All Users with 31 Days Plus Onboarding are updated successfully.',
            totalOnboardingUsers31DaysCompleted: {
              users: [
                {
                  userId: 'R4qppGmmAvJzQXI4jvuc',
                  discordId: '799600467218923521',
                  username: 'AnishPawaskar',
                },
                {
                  userId: 'W7hqS6BJqWzNW2ejeimC',
                  discordId: '700385688557715456',
                  username: 'amandixit',
                },
              ],
              count: 2,
            },
            totalUsersHavingNoDiscordId: 0,
            totalArchivedUsers: 0,
            usersAlreadyHavingOnboaring31DaysRole: {
              users: [],
              count: 0,
            },
            totalOnboarding31dPlusRoleApplied: {
              count: 2,
              response: [
                {
                  message: 'Role added successfully',
                  discordId: '799600467218923521',
                },
                {
                  message: 'Role added successfully',
                  discordId: '700385688557715456',
                },
              ],
            },
            totalOnboarding31dPlusRoleNoteApplied: {
              count: 0,
              errors: [],
            },
            totalOnboarding31dPlusRoleRemoved: {
              count: 0,
              response: [],
            },
            totalOnboarding31dPlusRoleNotRemoved: {
              count: 0,
              errors: [],
            },
            errorInFetchingUserDetailsForRoleRemoval: {
              count: 0,
              errors: [],
            },
          }),
        });
      } else {
        interceptedRequest.continue();
      }
    });
  });

  afterAll(async () => {
    await browser.close();
  });
  beforeEach(async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/`);
    await page.waitForNetworkIdle();
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
  it('should display the task requests button', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}`);
    await page.waitForNetworkIdle();
    const taskRequestsButton = await page.$('#task-requests-link');
    expect(taskRequestsButton).toBeTruthy();
  });
  it('should go to the task requests page', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}`);
    await page.waitForNetworkIdle();

    const taskRequestsButton = await page.$('#task-requests-link');
    await taskRequestsButton.click();
    await page.waitForNetworkIdle();
    const newUrl = page.url();
    expect(newUrl).toContain('/task-requests');
  });
  it('should call the right api endpoint when Sync External Accounts button is clicked', async () => {
    let isRightUrlCalled = false;
    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      const httpMethod = interceptedRequest.method();
      if (
        url ===
          `${STAGING_API_URL}/external-accounts/users?action=discord-users-sync` &&
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

  it('should display the Sync Idle 7d+ Users On Discord button', async () => {
    const syncIdle7dPlusUsersButton = await page.$('#sync-idle-7d-Plus-users');
    expect(syncIdle7dPlusUsersButton).toBeTruthy();

    const spinnerInsideSyncIdle7dPlusUsers = await syncIdle7dPlusUsersButton.$(
      '.spinner',
    );
    expect(spinnerInsideSyncIdle7dPlusUsers).toBeTruthy();

    const syncIdle7dPlusUsersUpdate = await page.$(
      '#sync-idle-7d-Plus-users-update',
    );
    expect(syncIdle7dPlusUsersUpdate).toBeTruthy();
  });

  it('should display the latest sync date when a super_user clicks on the Sync Idle 7d+ Users On Discord button', async () => {
    await page.evaluate(() => {
      document.querySelector('#sync-idle-7d-Plus-users').click();
    });
    await page.waitForNetworkIdle();

    const latestSyncStatusElement = await page.waitForSelector(
      '#sync-idle-7d-Plus-users-update',
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

  it('should display the Activity Feed anchor button', async () => {
    const createActivityFeedButton = await page.$('#create-activity-feed');
    expect(createActivityFeedButton).toBeTruthy();
    const createActivityFeedButtonHref = await page.evaluate(
      (el) => el.getAttribute('href'),
      createActivityFeedButton,
    );
    expect(createActivityFeedButtonHref).toBe('/feed/index.html');
  });

  it('should display the Requests anchor button', async () => {
    const requestsButton = await page.$('#requests-link');
    expect(requestsButton).toBeTruthy();
    const requestsButtonHref = await page.evaluate(
      (el) => el.getAttribute('href'),
      requestsButton,
    );
    expect(requestsButtonHref).toBe('/requests/index.html');
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

  it('Check user profile with dropdown options', async () => {
    const DROPDOWN_OPTIONS = [
      {
        name: 'Home',
        link: 'https://dashboard.realdevsquad.com/',
      },
      {
        name: 'Status',
        link: 'https://my.realdevsquad.com/',
      },
      {
        name: 'Profile',
        link: 'https://my.realdevsquad.com/profile',
      },
      {
        name: 'Tasks',
        link: 'https://my.realdevsquad.com/tasks',
      },
      {
        name: 'Identity',
        link: 'https://my.realdevsquad.com/identity',
      },
    ];

    await page.waitForTimeout(1500);

    const userName = await page.$eval(
      '#user-name',
      (element) => element.textContent,
    );
    const userImage = await page.$eval('#user-img', (element) => element.src);
    expect(userName).toContain(superUserData.first_name);
    expect(userImage).toEqual(superUserData.picture.url);

    const userInfoButton = await page.$('.user-info');
    await userInfoButton.click();

    const hrefs = await page.$$eval(
      '.dropdown-list .dropdown-item a',
      (elements) => elements.map((element) => element.getAttribute('href')),
    );

    const expectedHrefs = DROPDOWN_OPTIONS.map((option) => option.link);

    expect(hrefs).toEqual(expectedHrefs);

    const signoutButton = await page.$('#signout-option');
    await signoutButton.click();
    const signinButton = await page.$('.sign-in-btn');

    expect(signinButton).toBeTruthy();
  });

  it('should display the Sync Onboarding 31d+ button', async () => {
    const syncOnboarding31dPlusUsersButton = await page.$(
      '#sync-onboarding-31d-plus-users',
    );
    expect(syncOnboarding31dPlusUsersButton).toBeTruthy();

    const spinnerInsideSyncOnboarding31dPlusUsers =
      await syncOnboarding31dPlusUsersButton.$('.spinner');
    expect(spinnerInsideSyncOnboarding31dPlusUsers).toBeTruthy();

    const syncOnboarding31dPlusUsersUpdate = await page.$(
      '#sync-onboarding-31d-plus-users-update',
    );
    expect(syncOnboarding31dPlusUsersUpdate).toBeTruthy();
  });

  it('should display the latest sync date when a super_user clicks on the  Sync Onboarding 31d+ button', async () => {
    await page.evaluate(() => {
      document.querySelector('#sync-onboarding-31d-plus-users').click();
    });
    await page.waitForNetworkIdle();

    const latestSyncStatusElement = await page.waitForSelector(
      '#sync-onboarding-31d-plus-users-update',
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

  it('should display Applications button', async () => {
    const applicationButton = await page.$('#application-button');
    expect(applicationButton).toBeTruthy();
    const applicationButtonHref = await page.evaluate(
      (el) => el.getAttribute('href'),
      applicationButton,
    );
    expect(applicationButtonHref).toBe('/applications');
    const applicationButtonText = await page.evaluate(
      (el) => el.innerText,
      applicationButton,
    );
    const trimmedApplicationButtonText = applicationButtonText.trim();
    expect(trimmedApplicationButtonText).toBe('Applications');
  });

  it('should close hamburger menu on clicking anywhere on the screen except the menu', async () => {
    await page.setViewport({ width: 970, height: 1800 });
    await page.goto(`${LOCAL_TEST_PAGE_URL}/index.html`);
    await page.evaluate(() => {
      Object.defineProperty(window, 'innerWidth', { value: 970 });
    });

    const hamIcon = await page.$('.hamburger');
    expect(hamIcon).toBeTruthy();
    await hamIcon.click();

    await page.waitForSelector('.links');

    const menu = await page.$('.active');
    expect(menu).toBeTruthy();

    await page.mouse.click(10, 10);

    await page.waitForSelector('.nav-links:not(.active)');
    const menuOff = await page.$('.nav-links:not(.active)');
    expect(menuOff).toBeTruthy();
  });
});
