const puppeteer = require('puppeteer');

describe('Input box', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:5500/task');
  });

  afterAll(async () => {
    await browser.close();
  });

  test('DependsOn input box should exist', async () => {
    const inputBox = await page.evaluate(() =>
      document.querySelector('.inputBox'),
    );

    expect(inputBox).toBeTruthy();
  });

  test('DependsOn input should have correct attributes', async () => {
    const input = await page.$('#dependsOn');
    const type = await input.evaluate((el) => el.getAttribute('type'));
    const name = await input.evaluate((el) => el.getAttribute('name'));
    const id = await input.evaluate((el) => el.getAttribute('id'));
    const placeholder = await input.evaluate((el) =>
      el.getAttribute('placeholder'),
    );
    const classList = await input.evaluate((el) => Array.from(el.classList));

    expect(type).toBe('text');
    expect(name).toBe('dependsOn');
    expect(id).toBe('dependsOn');
    expect(placeholder).toBe('Task ID separated with comma ');
    expect(classList.includes('notEditing')).toBeTruthy();
  });

  it('Links display span should exist', async () => {
    const linksDisplay = await page.evaluate(() =>
      document.querySelector('#linksDisplay'),
    );
    expect(linksDisplay).toBeTruthy();
  });
});
