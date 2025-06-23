const puppeteer = require('puppeteer');
const {
  photoVerificationRequestApprovedResponse,
  photoVerificationRequestRejectedResponse,
  photoVerificationRequestsListPending,
  photoVerificationRequestsListUserSearch,
  photoVerificationRequestDiscordUpdateResponse,
} = require('../../mock-data/photo-verification');
// const {
//   extensionRequestLogs,
//   extensionRequestLogsInSentence,
// } = require('../../mock-data/logs');
// const {
//   userSunny,
//   userRandhir,
//   allUsersData,
//   superUserForAudiLogs,
//   searchedUserForAuditLogs,
// } = require('../../mock-data/users');
// const { usersStatus } = require('../../mock-data/users-status');
const baseUrl = 'http://localhost:8000/photo-verification-requests';

describe('Tests the Photo Verification Screen', () => {
  let browser;
  let page;
  let title;
  let searchBar;
  let photoVerificationRequestsElement;
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
      if (url === 'https://api.realdevsquad.com/users/picture/all/') {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(photoVerificationRequestsListPending),
        });
      } else if (
        url ===
        'https://api.realdevsquad.com/users/picture/all/?username=vinayak-g'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(photoVerificationRequestsListUserSearch),
        });
      } else if (
        url ===
        `https://api.realdevsquad.com/users/picture/verify/${photoVerificationRequestsListPending.data[0].userId}/?status=APPROVED&type=both`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(photoVerificationRequestApprovedResponse),
        });
      } else if (
        url ===
        `https://api.realdevsquad.com/users/picture/verify/${photoVerificationRequestsListPending.data[0].userId}/?status=REJECTED&type=both`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(photoVerificationRequestRejectedResponse),
        });
      } else if (
        url ===
        `https://api.realdevsquad.com/discord-actions/avatar/photo-verification-update/${photoVerificationRequestsListPending.data[0].discordId}`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(photoVerificationRequestDiscordUpdateResponse),
        });
      } else {
        interceptedRequest.continue();
      }
    });

    await page.goto(baseUrl);

    await page.waitForNetworkIdle();

    title = await page.$('.header');
    searchBar = await page.$('#search');
    photoVerificationRequestsElement = await page.$(
      '.photo-verification-requests',
    );
  });

  afterEach(async () => {
    await page.goto('http://localhost:8000/photo-verification-requests');
    await page.waitForNetworkIdle();
  });
  afterAll(async () => {
    await browser.close();
  });
  it('Checks the UI elements on photo verification requests listing page', async () => {
    title = await page.$('.header');
    searchBar = await page.$('#search');
    photoVerificationRequestCardList = await page.$$(
      '.photo-verification-card',
    );
    photoVerificationRequestsElement = await page.$(
      '.photo-verification-requests',
    );
    expect(title).toBeTruthy();
    expect(searchBar).toBeTruthy();
    expect(photoVerificationRequestCardList.length).toBe(2);
    expect(photoVerificationRequestsElement).toBeTruthy();
  });

  it('checks the search functionality', async () => {
    await page.type('#user-search', 'vinayak-g');
    await page.keyboard.press('Enter');
    await page.waitForNetworkIdle();

    const cardsList = await page.$$('.photo-verification-card');
    expect(cardsList.length).toBe(1);
    const cardTextContent = await page.evaluate(
      (element) => element.textContent,
      cardsList[0],
    );
    expect(cardTextContent).toContain('vinayak-g');
  });

  it('checks the refresh discord avatar image functionality', async () => {
    const photoVerificationRequestId =
      photoVerificationRequestsListPending.data[0].id;

    photoVerificationRequestCard = await page.$(
      `.photo-verification-card--${photoVerificationRequestId}`,
    );

    const refreshButton = await photoVerificationRequestCard.$(
      '.refresh-discord-avatar-button',
    );

    await refreshButton.click();
    // wait for 500ms for the request to complete
    await page.waitForTimeout(500);

    photoVerificationRequestCard = await page.$(
      `.photo-verification-card--${photoVerificationRequestId}`,
    );

    const discordImage = await photoVerificationRequestCard.$(
      '.photo-verification-image-box__block--discord',
    );

    const discordImageSrc = await page.evaluate(
      (element) => element.querySelector('img').src,
      discordImage,
    );

    expect(discordImageSrc).toBe(
      photoVerificationRequestDiscordUpdateResponse.discordAvatarUrl,
    );
  });
  it('checks the reject photo verification functionality', async () => {
    const photoVerificationRequestId =
      photoVerificationRequestsListPending.data[0].id;

    photoVerificationRequestCard = await page.$(
      `.photo-verification-card--${photoVerificationRequestId}`,
    );

    const rejectButton = await photoVerificationRequestCard.$('.reject-button');

    await rejectButton.click();
    // wait for 2500ms for the request to complete
    await page.waitForTimeout(2500);

    photoVerificationRequestCard = await page.$(
      `.photo-verification-card--${photoVerificationRequestId}`,
    );

    expect(photoVerificationRequestCard).toBe(null);
  });

  it('checks the reject photo verification functionality', async () => {
    await page.evaluate(() => {
      window.location.reload = () => {
        console.log('window.location.reload was called');
      };
    });
    const photoVerificationRequestId =
      photoVerificationRequestsListPending.data[0].id;

    photoVerificationRequestCard = await page.$(
      `.photo-verification-card--${photoVerificationRequestId}`,
    );

    const approveButton = await photoVerificationRequestCard.$(
      '.approve-both-button',
    );

    await approveButton.click();
    // wait for 500ms for the request to complete
    await page.waitForTimeout(500);

    photoVerificationRequestCard = await page.$(
      `.photo-verification-card--${photoVerificationRequestId}`,
    );

    responseMessage = await photoVerificationRequestCard.$eval(
      'p',
      (el) => el.textContent,
    );

    expect(responseMessage).toBe(
      photoVerificationRequestApprovedResponse.message,
    );
  });

  it('Checks details of the first photo verification card', async () => {
    photoVerificationRequestCardList = await page.$$(
      '.photo-verification-card',
    );

    const firstPhotoVerificationRequestCard =
      photoVerificationRequestCardList[0];

    const titleText = await firstPhotoVerificationRequestCard.$eval(
      'h3',
      (el) => el.textContent,
    );
    expect(titleText).toBe(
      `Photo Verifcation for ${photoVerificationRequestsListPending.data[0].user.username}`,
    );
  });
});
