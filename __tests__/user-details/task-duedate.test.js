const puppeteer = require('puppeteer');
const {
  userDetailsApi,
} = require('../../mock-data/tasks-card-date-time-end-date-user/index'); //has user info
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
      } else {
        interceptedRequest.continue();
      }
    });
    await page.goto(
      'http://localhost:8000/users/details/index.html?username=sunny-s',
    );

    await page.evaluate(async () => {
      // We write the function with superUser as true

      async function accessingUserData() {
        const isSuperUser = true;
        if (isSuperUser) {
          await getUserTasks();
          await getUserPrs();
          await generateAcademicTabDetails();
          toggleAccordionTabsVisibility();
        } else {
          lockAccordiansForNonSuperUser();
        }
      }

      // Calling the function
      await accessingUserData();
    });

    await page.waitForNetworkIdle();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should go to tasks section', async () => {
    const taskDiv = await page.$('.accordion-tasks');
    expect(taskDiv).toBeTruthy();

    await page.evaluate((element) => {
      element.style.backgroundColor = 'yellow'; // Change color to blue
    }, taskDiv);

    await taskDiv.click();

    await page.waitForTimeout(500);
  });

  it('should select and interact with element', async () => {
    const paragraphElement = await page.$('.due-date-value'); //// Selecting the element with the specified class for our due date value

    // Checking if the element is found
    expect(paragraphElement).toBeTruthy();

    const textContent = await page.evaluate(
      (element) => element.textContent,
      paragraphElement,
    ); // Getting the text content of the element to align with the readable format that we have
    console.log('Text content:', textContent);

    expect(textContent).toBe('Thu Jul 27 2023'); // we are expecting the text content to be in the following format

    await page.evaluate((element) => {
      element.style.backgroundColor = 'blue'; // Changing background color for pointing out
      element.textContent = 'Correct Date format'; // Changing text content to show we got the right format
    }, paragraphElement);

    await page.waitForTimeout(500); // Waiting for a moment to check the changes (helpful when )
  });
});
