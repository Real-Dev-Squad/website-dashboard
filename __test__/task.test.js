const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const puppeteer = require('puppeteer');
const API_BASE_URL = 'https://api.realdevsquad.com';

describe('Input box', () => {
  let inputBox;
  let label;
  let select;
  let option;

  beforeEach(() => {
    const dom = new JSDOM(`
      <div class="inputBox">
        <label for="dependsOn" class="editable"> dependsOn </label>
        <select
          required
          class="input notEditing"
          id="dependsOn"
          name="dependsOn"
          multiple
        >
          <option disabled selected>Select dependsOn</option>
        </select>
      </div>
    `);

    const { document } = dom.window;

    inputBox = document.querySelector('.inputBox');
    label = inputBox.querySelector('label');
    select = inputBox.querySelector('select');
    option = inputBox.querySelector('option');
  });

  test('renders with correct attributes', () => {
    expect(label.getAttribute('for')).toBe('dependsOn');
    expect(select.hasAttribute('required')).toBe(true);
    expect(select.hasAttribute('multiple')).toBe(true);
    expect(option.hasAttribute('disabled')).toBe(true);
    expect(option.hasAttribute('selected')).toBe(true);
  });

  test('renders with correct text content', () => {
    expect(label.textContent).toBe(' dependsOn ');
    expect(option.textContent).toBe('Select dependsOn');
  });
});

describe('fetchDependency', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('fetches tasks from API', async () => {
    await page.goto(`${API_BASE_URL}/tasks`);
    const response = await page.evaluate((baseUrl) => {
      return fetch(`${baseUrl}/tasks`).then((response) => response.json());
    }, API_BASE_URL);
    const { tasks } = response;
    expect(tasks).toBeDefined();
  }, 10000);
});
