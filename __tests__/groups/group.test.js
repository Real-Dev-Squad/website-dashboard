const puppeteer = require('puppeteer');
const { allUsersData, superUserData } = require('../../mock-data/users');
const { discordGroups, GroupRoleData } = require('../../mock-data/groups');
const {
  STAGING_API_URL,
  LOCAL_TEST_PAGE_URL,
} = require('../../mock-data/constants');
function setSuperUserPermission() {
  allUsersData.users[0] = superUserData;
}

function resetUserPermission() {
  allUsersData.users[0] = {
    ...allUsersData.users[0],
    roles: { archived: false },
  };
}

describe('Discord Groups Page', () => {
  let browser;
  let page;
  jest.setTimeout(60000);

  // Shared constants for date formatting tests
  const TEST_TIMESTAMP = Date.UTC(2024, 10, 6, 10, 15);
  const FULL_DATE_FORMAT_OPTIONS = {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    hour12: true,
  };

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: ['--disable-web-security'],
      devtools: false,
    });
    page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();

      if (interceptedRequest.method() === 'GET') {
        if (url === `${STAGING_API_URL}/users/`) {
          interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify(allUsersData),
          });
        } else if (url === `${STAGING_API_URL}/users?profile=true`) {
          interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify(allUsersData.users[0]),
          });
        } else if (url === `${STAGING_API_URL}/discord-actions/groups`) {
          interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify(discordGroups),
          });
        } else if (url === `${STAGING_API_URL}/discord-actions/roles`) {
          interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify(GroupRoleData),
          });
        } else {
          interceptedRequest.continue();
        }
      } else if (interceptedRequest.method() === 'POST') {
        if (url === `${STAGING_API_URL}/discord-actions/groups`) {
          const postData = interceptedRequest.postData();
          const groupData = JSON.parse(postData);
          // discordGroups.push(groupData);
          interceptedRequest.respond({
            status: 201,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify({ message: 'Group created successfully' }),
          });
        } else if (url === `${STAGING_API_URL}/discord-actions/roles`) {
          interceptedRequest.respond({
            status: 201,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify({ message: 'Role created successfully' }),
          });
        } else {
          interceptedRequest.continue();
        }
      } else if (interceptedRequest.method() === 'DELETE') {
        if (url === `${STAGING_API_URL}/discord-actions/roles`) {
          interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify({ message: 'Role deleted successfully' }),
          });
        } else if (
          url ===
          `${STAGING_API_URL}/discord-actions/groups/CqnEhbwtCqdcZdlrixLn`
        ) {
          interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify({
              message: 'Group role deleted successfully',
            }),
          });
        } else {
          interceptedRequest.continue();
        }
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto(`${LOCAL_TEST_PAGE_URL}/groups`);
    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Page title should be "Discord Groups"', async () => {
    const pageTitle = await page.title();
    expect(pageTitle).toBe('Discord Groups | Real Dev Squad');
  });

  test('Should display cards', async () => {
    await page.waitForSelector('.card');
    const cards = await page.$$('.card');

    expect(cards.length).toBeGreaterThan(0);
  });

  test('Should display card details', async () => {
    const card = await page.$('.card');
    const groupTitle = await card.$eval('.card__title', (el) => el.textContent);
    const groupDescription = await card.$eval(
      '.card__description',
      (el) => el.textContent,
    );
    const groupCount = await card.$eval('.card__count', (el) => el.textContent);

    expect(groupTitle).toBeTruthy();
    expect(groupDescription).toBeTruthy();
    expect(groupCount).toBeTruthy();
  });

  test('Should display card with a button with text "Add me" or "Remove me"', async () => {
    const card = await page.$('.card');
    const buttonText = await card.$eval('.card__btn', (el) => el.textContent);

    expect(buttonText).toMatch(/Add me|Remove me/);
  });

  test('Should display search bar', async () => {
    const searchEl = await page.$('.search');

    expect(searchEl).toBeTruthy();
  });

  test('Should display group creation button', async () => {
    const createGroupBtn = await page.$('.create-group');

    expect(createGroupBtn).toBeTruthy();
  });

  test('Should display group creation modal on group creation button click', async () => {
    const createGroupBtn = await page.$('.create-group');

    await createGroupBtn.click();
    const groupCreationModal = await page.waitForSelector(
      '.group-creation-modal',
    );

    expect(groupCreationModal).toBeTruthy();
  });

  test('Should display group creation modal with input fields', async () => {
    const groupCreationModal = await page.$('.group-creation-modal');
    const groupTitle = await groupCreationModal.$(
      `.input__field[name="title"]`,
    );
    const groupDescription = await groupCreationModal.$(
      `.input__field[name="description"]`,
    );
    const submitBtn = await groupCreationModal.$('.submit__button');

    expect(groupTitle).toBeTruthy();
    expect(groupDescription).toBeTruthy();
    expect(submitBtn).toBeTruthy();
  });

  test('Should group creation modal have clear button to clear title', async () => {
    const groupCreationModal = await page.$('.group-creation-modal');
    const groupTitle = await groupCreationModal.$(
      `.input__field[name="title"]`,
    );
    const clearBtn = await groupCreationModal.$('#clear-input');

    await groupTitle.type('Test Group');
    await clearBtn.click();

    const titleValue = await groupTitle.evaluate((el) => el.value);

    expect(titleValue).toBe('');
  });

  test('Should display group creation modal with close button', async () => {
    const groupCreationModal = await page.$('.group-creation-modal');
    const closeBtn = await groupCreationModal.$('#close-button');

    expect(closeBtn).toBeTruthy();
  });

  test('Should close group creation modal on close button click', async () => {
    const groupCreationModal = await page.$('.group-creation-modal');
    const closeBtn = await groupCreationModal.$('#close-button');

    await closeBtn.click();
    const groupCreationModalClosed = await page.$('.group-creation-modal');

    expect(groupCreationModalClosed).toBeFalsy();
  });

  test('Should display only specified groups when name=<group-name> with different case', async () => {
    const groupNames = 'fIrSt,DSA+COdInG';
    await page.goto(`${LOCAL_TEST_PAGE_URL}/groups?name=${groupNames}`);
    await page.waitForNetworkIdle();

    const displayedGroups = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.card__title')).map(
        (el) => el.textContent,
      );
    });

    expect(displayedGroups).toEqual(['First Daaa', 'DSA Coding Group']);
  });

  test('Should display no group found div when no group is present', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/groups?name=no-group-present`);
    await page.waitForNetworkIdle();

    const noGroupDiv = await page.$('.no-group-container');

    expect(noGroupDiv).toBeTruthy();
  });

  it('should display the footer with the correct repo link', async () => {
    const footer = await page.$('[data-test-id="footer"]');
    expect(footer).toBeTruthy();

    const infoRepo = await footer.$('[data-test-id="info-repo"]');
    expect(infoRepo).toBeTruthy();

    const repoLink = await infoRepo.$('[data-test-id="repo-link"]');
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

  test('Should display delete button for super users', async () => {
    setSuperUserPermission();
    await page.goto(`${LOCAL_TEST_PAGE_URL}/groups`);
    await page.waitForNetworkIdle();
    await page.waitForTimeout(1000);

    const deleteButtons = await page.$$('.delete-group');
    const cards = await page.$$('.card');
    expect(deleteButtons.length).toBe(cards.length);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  test('Should not display delete button when user is normal user', async () => {
    resetUserPermission();
    await page.goto(`${LOCAL_TEST_PAGE_URL}/groups`);
    await page.waitForNetworkIdle();

    const deleteButtons = await page.$$('.delete-group');
    expect(deleteButtons.length).toBe(0);
  });

  test('Should display delete confirmation modal on click of delete button', async () => {
    setSuperUserPermission();
    await page.goto(`${LOCAL_TEST_PAGE_URL}/groups`);
    await page.waitForNetworkIdle();
    await page.waitForTimeout(1000);

    const deleteButton = await page.$('.delete-group');
    await deleteButton.click();

    const deleteConfirmationModal = await page.waitForSelector(
      '.delete-confirmation-modal',
    );

    expect(deleteConfirmationModal).toBeTruthy();
  });

  test('Should close delete confirmation modal when cancel button is clicked', async () => {
    setSuperUserPermission();
    await page.goto(`${LOCAL_TEST_PAGE_URL}/groups`);
    await page.waitForNetworkIdle();
    await page.waitForTimeout(1000);

    const deleteButton = await page.$('.delete-group');
    await deleteButton.click();

    const cancelButton = await page.waitForSelector('#cancel-delete');
    await cancelButton.click();

    const modalClosed = await page.$('.delete-confirmation-modal');
    expect(modalClosed).toBeFalsy();
  });

  test('Should render loader when deleting a group', async () => {
    setSuperUserPermission();
    await page.goto(`${LOCAL_TEST_PAGE_URL}/groups`);
    await page.waitForNetworkIdle();
    await page.waitForTimeout(1000);

    const deleteButton = await page.$('.delete-group');
    await deleteButton.click();

    const confirmButton = await page.waitForSelector('#confirm-delete');
    confirmButton.click();

    const loader = await page.waitForSelector('.loader');
    expect(loader).toBeTruthy();

    await page.waitForNetworkIdle();

    const loaderAfter = await page.$('.loader');
    expect(loaderAfter).toBeFalsy();
  });

  it('should show success toast when trying to delete a group', async function () {
    setSuperUserPermission();
    await page.goto(`${LOCAL_TEST_PAGE_URL}/groups?dev=true`);
    await page.waitForNetworkIdle();
    const deleteButton = await page.$('.delete-group');
    await deleteButton.click();

    const confirmButton = await page.waitForSelector('#confirm-delete');
    confirmButton.click();

    await page.waitForSelector('[data-testid="toast-component"].show');
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
      'Group deleted successfully',
    );
  });
  test('Should display last used label and tooltip when lastUsedOn is present', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/groups`);
    await page.waitForNetworkIdle();

    const groupCardHandle = await page.evaluateHandle(() => {
      const cards = Array.from(document.querySelectorAll('.card'));
      return (
        cards.find((card) => {
          const el = card.querySelector('.card__last-used');
          return el && getComputedStyle(el).display !== 'none';
        }) || null
      );
    });

    expect(groupCardHandle).toBeTruthy();

    const lastUsedText = await page.evaluate((card) => {
      const el = card.querySelector('.card__last-used');
      if (!el) return '';
      const tooltipElement = el.querySelector('.tooltip');
      if (tooltipElement) {
        const fullText = el.textContent.trim();
        const tooltipText = tooltipElement.textContent.trim();
        return fullText.replace(tooltipText, '').trim();
      }
      const firstChildNode = el.childNodes[0];
      if (firstChildNode && firstChildNode.nodeType === Node.TEXT_NODE)
        return firstChildNode.textContent.trim();
      return el.textContent.trim();
    }, groupCardHandle);

    expect(lastUsedText).toMatch(/^Last used on: \d{1,2} [A-Za-z]{3} \d{4}$/);

    const tooltipText = await page.evaluate((card) => {
      const tooltipElement = card.querySelector('.card__last-used .tooltip');
      return tooltipElement ? tooltipElement.textContent.trim() : '';
    }, groupCardHandle);

    expect(tooltipText.length).toBeGreaterThan(0);
  });

  test('Should hide last used label when lastUsedOn is absent', async () => {
    await page.goto(`${LOCAL_TEST_PAGE_URL}/groups`);
    await page.waitForNetworkIdle();

    const isAnyCardHidden = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.card'));
      return cards.some((card) => {
        const el = card.querySelector('.card__last-used');
        return el && getComputedStyle(el).display === 'none';
      });
    });

    expect(isAnyCardHidden).toBe(true);
  });

  test('Should return correctly formatted full date string and N/A for invalid inputs', async () => {
    const evaluationResult = await page.evaluate(
      async (timestamp, fullDateFormatOptions) => {
        const utilsModule = await import('/groups/utils.js');
        const formatted = utilsModule.fullDateString(timestamp);
        const expected = new Intl.DateTimeFormat(
          'en-US',
          fullDateFormatOptions,
        ).format(new Date(timestamp));
        const invalidString = utilsModule.fullDateString('abc');
        const invalidNotANumber = utilsModule.fullDateString(NaN);
        const invalidObject = utilsModule.fullDateString({});
        return {
          formatted,
          expected,
          invalidString,
          invalidNotANumber,
          invalidObject,
        };
      },
      TEST_TIMESTAMP,
      FULL_DATE_FORMAT_OPTIONS,
    );

    expect(evaluationResult.formatted).toBe(evaluationResult.expected);
    expect(evaluationResult.invalidString).toBe('N/A');
    expect(evaluationResult.invalidNotANumber).toBe('N/A');
    expect(evaluationResult.invalidObject).toBe('N/A');
  });

  test('Should return correctly formatted short date string and N/A for invalid inputs', async () => {
    const evaluationResult = await page.evaluate(async (timestamp) => {
      const utilsModule = await import('/groups/utils.js');
      const formatted = utilsModule.shortDateString(timestamp);
      const dateInstance = new Date(timestamp);
      const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
        dateInstance,
      );
      const expected = `${dateInstance.getDate()} ${month} ${dateInstance.getFullYear()}`;
      const invalidUndefined = utilsModule.shortDateString(undefined);
      const invalidStringInput = utilsModule.shortDateString('bad');
      const invalidNotANumber = utilsModule.shortDateString(NaN);
      return {
        formatted,
        expected,
        invalidUndefined,
        invalidStringInput,
        invalidNotANumber,
      };
    }, TEST_TIMESTAMP);

    expect(evaluationResult.formatted).toBe(evaluationResult.expected);
    expect(evaluationResult.invalidUndefined).toBe('N/A');
    expect(evaluationResult.invalidStringInput).toBe('N/A');
    expect(evaluationResult.invalidNotANumber).toBe('N/A');
  });
});
