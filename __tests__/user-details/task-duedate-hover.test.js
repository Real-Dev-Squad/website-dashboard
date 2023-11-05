const puppeteer = require('puppeteer');
const {
  userDetailsApi,
  usersTasksInDev,
} = require('../../mock-data/task-card-date-hover/index'); //has user info
const {
  superUserDetails,
} = require('../../mock-data/tasks-card-date-time-end-date-self/index'); // has super user info

describe('Tasks On User Management Page', () => {
  let browser;
  let page;

  jest.setTimeout(60000);

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new', //change headless to 'new' to check the tests in browser
      ignoreHTTPSErrors: true,
      args: ['--incognito', '--disable-web-security'],
      devtools: false,
    });
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url === 'https://api.realdevsquad.com/tasks/sunny-s') {
        // When we encounter the respective api call we respond with the below response
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(userDetailsApi),
        });
      } else if (url === 'https://api.realdevsquad.com/users/self') {
        // When we encounter the respective api call we respond with the below response
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(superUserDetails), // Y contains the json of a superuser in the server which will grant us the access to view the page without locks
        });
      } else if (
        url ===
        ' https://api.realdevsquad.com/tasks/?size=3&dev=true&assignee=ajeyakrishna'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(usersTasksInDev['initial']), // Y contains the json of a superuser in the server which will grant us the access to view the page without locks
        });
      } else if (
        url ===
        'https://api.realdevsquad.com/tasks?dev=true&assignee=ajeyakrishna&size=3&next=vvTPGHAs9w36oY1UnV8r'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(usersTasksInDev['vvTPGHAs9w36oY1UnV8r']), // Y contains the json of a superuser in the server which will grant us the access to view the page without locks
        });
      } else if (
        url ===
        'https://api.realdevsquad.com/tasks?dev=true&assignee=ajeyakrishna&size=3&next=i1LQOKkGhhpOxE6yEo3A'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(usersTasksInDev['i1LQOKkGhhpOxE6yEo3A']), // Y contains the json of a superuser in the server which will grant us the access to view the page without locks
        });
      } else if (
        url ===
        'https://api.realdevsquad.com/tasks?dev=true&assignee=ajeyakrishna&size=3&next=OhNeSTj5J72PhrA4mtrr'
      ) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify(usersTasksInDev['OhNeSTj5J72PhrA4mtrr']), // Y contains the json of a superuser in the server which will grant us the access to view the page without locks
        });
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto(
      'http://localhost:8000/users/details/index.html?username=sunny-s',
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
    // Select all elements with the specified class
    const elements = await page.$$('.due-date-value');

    // Checking if elements are found
    expect(elements).toBeTruthy();

    for (const element of elements) {
      const textContent = await element.evaluate((el) => el.textContent);

      await expect(textContent).toMatch(
        /Task has been completed within Committed timeline|\d+ Days Remaining|Deadline Passed|Less Than a Day Remaining|1 Day Remaining/,
      );

      await element.evaluate((el) => {
        el.style.backgroundColor = 'blue'; // Changing background color for pointing out
      });

      await page.waitForTimeout(200); //waiting for a moment to check changes(very helpful when you turn headless into false), please increase value to 2000 or above to see clear changes
    }

    await page.waitForTimeout(500); //waiting for a moment to check changes(very helpful when you turn headless into false)
  });

  it('should interact with hover elements', async () => {
    // Select all elements with the same selector
    const elementsSelector = '.due-date-value';

    // Find and interact with each element individually
    const elements = await page.$$(elementsSelector);

    for (const element of elements) {
      await element.hover();
      await page.waitForSelector('.task-due-date');
      //   const hoverContext = await page.hover('.task-due-date');
      const tooltipText = await page.$eval(
        '.task-due-date',
        (tooltip) => tooltip.textContent,
      );

      await expect(tooltipText).toMatch(
        /Due Date: Thu Jul 27 2023|Due Date: Sat Sep 09 2023|Tue Jul 04 2023/,
      );

      await page.waitForTimeout(200); //waiting for a moment to check changes(very helpful when you turn headless into false), please increase value to 2000 or above to see clear changes
    }

    await page.waitForTimeout(500); //waiting for a moment to check changes(very helpful when you turn headless into false)
  });
  it('tasks should not have scroll bar in y direction when rendered without dev mode', async () => {
    await page.goto(
      'http://localhost:8000/users/details/index.html?username=ajeyakrishna',
    );
    await page.waitForNetworkIdle();
    const taskDiv = await page.$$('.accordion-tasks');
    expect(taskDiv).toBeTruthy();
    await taskDiv[0].click();

    const userTasksDevDiv = await page.$('.user-tasks');
    const scrollHeight = await page.evaluate(
      (element) => element.scrollHeight,
      userTasksDevDiv,
    );
    const clientHeight = await page.evaluate(
      (element) => element.clientHeight,
      userTasksDevDiv,
    );
    expect(scrollHeight > clientHeight).toBe(false);
  });

  it('tasks should have scroll bar in y direction when rendered in dev mode', async () => {
    await page.goto(
      'http://localhost:8000/users/details/index.html?username=ajeyakrishna&dev=true',
    );
    await page.waitForNetworkIdle();
    const taskDiv = await page.$$('.accordion-tasks');
    expect(taskDiv).toBeTruthy();
    await taskDiv[0].click();

    const userTasksDevDiv = await page.$('.user-tasks-dev');
    const scrollHeight = await page.evaluate(
      (element) => element.scrollHeight,
      userTasksDevDiv,
    );
    const clientHeight = await page.evaluate(
      (element) => element.clientHeight,
      userTasksDevDiv,
    );
    expect(scrollHeight > clientHeight).toBe(true);
  });
  it('Scroll of task should work in dev mode', async () => {
    await page.goto(
      'http://localhost:8000/users/details/index.html?username=ajeyakrishna&dev=true',
    );
    await page.waitForNetworkIdle();
    const taskDiv = await page.$$('.accordion-tasks');
    expect(taskDiv).toBeTruthy();
    await taskDiv[0].click();

    const userTasksDevDiv = await page.$('.user-tasks-dev');
    expect(userTasksDevDiv).toBeTruthy();

    await page.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    }, userTasksDevDiv);
    await page.waitForNetworkIdle();

    await page.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    }, userTasksDevDiv);
    await page.waitForNetworkIdle();

    await page.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    }, userTasksDevDiv);
    await page.waitForNetworkIdle();

    await page.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    }, userTasksDevDiv);
    await page.waitForNetworkIdle();

    let renderedTasks = await userTasksDevDiv.$$('.user-task');
    expect(Array.from(renderedTasks).length).toBe(12);
  });
});
