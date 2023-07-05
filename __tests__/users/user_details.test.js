describe('Puppeteer test', () => {
    let browser;
    let page;
  
    beforeAll(async () => {
      browser = await puppeteer.launch();
      page = await browser.newPage();
    });
  
    afterAll(async () => {
      await browser.close();
    });
  
    it('should render the FormPivotButton with correct properties and class', async () => {
      await page.goto('http://localhost:your_app_port'); // Replace with the actual URL of your app
      
      // Execute the code snippet you provided
      const userData = {}; // Set up a mock userData object if needed
      const socials = await page.$('.socials'); // Assuming the socials container has the class 'socials'
      
      if (userData?.profileURL) {
        const isSuperUser = await page.evaluate(() => checkUserIsSuperUser());
        
        const buttonProperties = await page.evaluate((isSuperUser, profileURL) => {
          return {
            isSuperUser,
            href: profileURL,
            alt: 'Intro',
            src: isSuperUser ? './../images/info.svg' : './../images/lock-icon.svg',
          };
        }, isSuperUser, userData.profileURL);
        
        const buttonClass = isSuperUser ? 'enabled' : 'disabled';
        await page.$eval('.socials', (socials, buttonProperties, buttonClass) => {
          const FormPivotButton = document.createElement('a');
          FormPivotButton.href = buttonProperties.href;
          FormPivotButton.alt = buttonProperties.alt;
          FormPivotButton.src = buttonProperties.src;
          FormPivotButton.classList.add(buttonClass);
          socials.appendChild(FormPivotButton);
        }, buttonProperties, buttonClass);
        
        if (!isSuperUser) {
          await page.hover('.socials a');
          const tooltipText = await page.$eval('.socials .tooltip', tooltip => tooltip.innerText);
          expect(tooltipText).toBe('You do not have required permissions to view this.');
          await page.waitForTimeout(1000); // Wait for the tooltip to be visible (optional)
        }
      }const puppeteer = require('puppeteer');

  
      // Add additional assertions or tests as needed
    });
  });
  