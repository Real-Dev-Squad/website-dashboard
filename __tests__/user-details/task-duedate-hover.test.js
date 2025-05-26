const puppeteer = require('puppeteer');
const {
  userDetailsApi,
  usersTasksInDev,
} = require('../../mock-data/task-card-date-hover/index'); //has user info
const {
  superUserDetails,
} = require('../../mock-data/tasks-card-date-time-end-date-self/index'); // has super user info
const { userDetails } = require('../../mock-data/user-details/index');
const { usersStatus } = require('../../mock-data/users-status/index');
const {
  STAGING_API_URL,
  LOCAL_TEST_PAGE_URL,
} = require('../../mock-data/constants');

describe('Tasks On User Management Page', () => {
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

      if (url === `${STAGING_API_URL}/users/sunny-s`) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(userDetails),
        });
      } else if (
        url === `${STAGING_API_URL}/users?profile=true` ||
        url === `${STAGING_API_URL}/users/ankush`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(superUserDetails),
        });
      } else if (
        url === `${STAGING_API_URL}/tasks/?size=3&dev=true&assignee=sunny-s` ||
        url === `${STAGING_API_URL}/tasks/?size=3&dev=true&assignee=ankush`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(usersTasksInDev['initial']),
        });
      } else if (
        url === `${STAGING_API_URL}/users/status/DtR9sK7CysOVHP17zl8N`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(usersStatus.allUserStatus[0]),
        });
      } else if (
        url ===
        `${STAGING_API_URL}/tasks?dev=true&assignee=ajeyakrishna&size=3&next=vvTPGHAs9w36oY1UnV8rr`
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(usersTasksInDev['OhNeSTj5J72PhrA4mtrr']),
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/users/details/index.html?username=sunny-s`,
    );

    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should go to tasks section', async () => {
    const taskDiv = await page.$('.accordion-tasks');
    expect(taskDiv).toBeTruthy();

    await taskDiv.click();

    await page.waitForTimeout(500);
  });

  it('should select and interact with text elements', async () => {
    const elements = await page.$$('.due-date-value');
    expect(elements).toBeTruthy();

    for (const element of elements) {
      const textContent = await element.evaluate((el) => el.textContent);

      await expect(textContent).toMatch(
        /Task has been completed within Committed timeline|\d+ Days Remaining|Deadline Passed|Less Than a Day Remaining|1 Day Remaining/,
      );

      await element.evaluate((el) => {
        el.style.backgroundColor = 'blue';
      });

      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(500);
  });

  it('should interact with hover elements', async () => {
    const elementsSelector = '.due-date-value';
    const elements = await page.$$(elementsSelector);

    for (const element of elements) {
      await element.hover();
      await page.waitForSelector('.task-due-date');
      const tooltipText = await page.$eval(
        '.task-due-date',
        (tooltip) => tooltip.textContent,
      );

      await expect(tooltipText).toMatch(
        /Due Date: Thu Jul 27 2023|Due Date: Sat Sep 09 2023|Tue Jul 04 2023/,
      );

      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(500);
  });

  it('Scroll of task should work', async () => {
    await page.goto(
      `${LOCAL_TEST_PAGE_URL}/users/details/index.html?username=ankush`,
    );
    await page.waitForNetworkIdle();
    const taskDiv = await page.$$('.accordion-tasks');
    expect(taskDiv).toBeTruthy();
    await taskDiv[0].click();

    const userTasksDevDiv = await page.$('.user-tasks-dev');
    expect(userTasksDevDiv).toBeTruthy();

    await page.evaluate(() => {
      window.scrollBy(0, window.document.body.scrollHeight);
    });
    await page.waitForNetworkIdle();

    await page.evaluate(() => {
      window.scrollBy(0, window.document.body.scrollHeight);
    });
    await page.waitForNetworkIdle();

    await page.evaluate(() => {
      window.scrollBy(0, window.document.body.scrollHeight);
    });
    await page.waitForNetworkIdle();

    await page.evaluate(() => {
      window.scrollBy(0, window.document.body.scrollHeight);
    });
    await page.waitForNetworkIdle();

    let renderedTasks = await userTasksDevDiv.$$('.user-task');
    expect(Array.from(renderedTasks).length).toBe(3);
  });

  // it('New task card should have all the detail fields', async () => {
  //   await page.goto(
  //     `${LOCAL_TEST_PAGE_URL}/users/details/index.html?username=sunny`,
  //   );
  //   await page.waitForNetworkIdle();
  //   const taskDiv = await page.$$('.accordion-tasks');
  //   expect(taskDiv).toBeTruthy();
  //   await taskDiv[0].click();

  //   const userTasksDevDiv = await page.$('.user-tasks-dev');
  //   expect(userTasksDevDiv).toBeTruthy();

  //   let renderedTasks = await page.$$('.user-task');
  //   let firstTask = await renderedTasks[0].$$('.task');
  //   let firstTaskHTML = await page.evaluate(
  //     (element) => element.innerHTML,
  //     firstTask[0],
  //   );

  //   expect(firstTaskHTML).toContain('<div class="task-title">');
  //   expect(firstTaskHTML).toContain('<progress');
  //   expect(firstTaskHTML).toContain('<div class="detail-block eta">');
  //   expect(firstTaskHTML).toContain('<div class="detail-block status">');
  //   expect(firstTaskHTML).toContain('<div class="detail-block startedOn">');
  //   expect(firstTaskHTML).toContain('<div class="detail-block priority">');
  //   expect(firstTaskHTML).toContain('<div class="detail-block createdBy">');
  //   expect(firstTaskHTML).toContain('<div class="detail-block type">');

  //   let secondTask = await renderedTasks[1].$$('.task');
  //   let secondTaskHTML = await page.evaluate(
  //     (element) => element.innerHTML,
  //     secondTask[0],
  //   );

  //   expect(secondTaskHTML).toContain('<div class="task-title">');
  //   expect(secondTaskHTML).toContain('<progress');
  //   expect(secondTaskHTML).toContain('<div class="detail-block eta">');
  //   expect(secondTaskHTML).toContain('<div class="detail-block status">');
  //   expect(secondTaskHTML).toContain('<div class="detail-block startedOn">');
  //   expect(secondTaskHTML).toContain('<div class="detail-block priority">');
  //   expect(secondTaskHTML).toContain('<div class="detail-block createdBy">');
  //   expect(secondTaskHTML).toContain('<div class="detail-block type">');

  //   let thirdTask = await renderedTasks[2].$$('.task');
  //   let thirdTaskHTML = await page.evaluate(
  //     (element) => element.innerHTML,
  //     thirdTask[0],
  //   );

  //   expect(thirdTaskHTML).toContain('<div class="task-title">');
  //   expect(thirdTaskHTML).toContain('<progress');
  //   expect(thirdTaskHTML).toContain('<div class="detail-block eta">');
  //   expect(thirdTaskHTML).toContain('<div class="detail-block status">');
  //   expect(thirdTaskHTML).toContain('<div class="detail-block startedOn">');
  //   expect(thirdTaskHTML).toContain('<div class="detail-block priority">');
  //   expect(thirdTaskHTML).toContain('<div class="detail-block createdBy">');
  //   expect(thirdTaskHTML).toContain('<div class="detail-block type">');

  //   await page.evaluate(() => {
  //     window.scrollBy(0, window.document.body.scrollHeight);
  //   });
  //   await page.waitForNetworkIdle();

  //   renderedTasks = await page.$$('.user-task');
  //   let fourthTask = await renderedTasks[3].$$('.task');
  //   let fourthTaskHTML = await page.evaluate(
  //     (element) => element.innerHTML,
  //     fourthTask[0],
  //   );

  //   expect(fourthTaskHTML).toContain('<div class="task-title">');
  //   expect(fourthTaskHTML).toContain('<progress');
  //   expect(fourthTaskHTML).toContain('<div class="detail-block eta">');
  //   expect(fourthTaskHTML).toContain('<div class="detail-block status">');
  //   expect(fourthTaskHTML).toContain('<div class="detail-block startedOn">');
  //   expect(fourthTaskHTML).toContain('<div class="detail-block priority">');
  //   expect(fourthTaskHTML).toContain('<div class="detail-block createdBy">');
  //   expect(fourthTaskHTML).toContain('<div class="detail-block type">');
  // });
});
