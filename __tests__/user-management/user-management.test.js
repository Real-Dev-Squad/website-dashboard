import '@testing-library/jest-dom/extend-expect';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import fetch from 'jest-fetch-mock';

const html = fs.readFileSync(
  path.resolve(__dirname, '../../user-management/index.html'),
  'utf8',
);

let dom;
let container;

describe('test the index.html page of user management', () => {
  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: 'dangerously' });
    container = dom.window.document;
  });

  it('renders the heading and title element', () => {
    expect(container.querySelector('title')).not.toBeNull();
    expect(container.querySelector('title').textContent).toBe(
      'User Management',
    );
    expect(container.querySelector('h1')).not.toBeNull();
    expect(container.querySelector('h1').textContent).toBe('User Management');
  });

  it('Users Search input element exists', () => {
    const inputElement = container.querySelector('#user-search');
    expect(inputElement).toBeTruthy();
    expect(inputElement).toHaveAttribute('placeholder', 'Search Users');
    const userNote = container.querySelector('#user-note');
    expect(userNote).toBeTruthy();
    expect(userNote.innerHTML).toBe('user can be searched by username only');
  });

  it('tile view and table view button element exist and have an image child with correct alt attribute', () => {
    const tableViewBtn = container.querySelector('#table-view-btn');
    expect(tableViewBtn).not.toBeNull();
    const imgTableViewBtn = tableViewBtn.querySelector('img');
    expect(imgTableViewBtn).toBeTruthy();
    expect(imgTableViewBtn.getAttribute('alt')).toBe('table-view');

    const tileViewBtn = container.querySelector('#tile-view-btn');
    expect(tileViewBtn).not.toBeNull();
    const imgTileViewBtn = tileViewBtn.querySelector('img');
    expect(imgTileViewBtn).toBeTruthy();
    expect(imgTileViewBtn.getAttribute('alt')).toBe('tile-view');
  });

  test('prevButton and nextButton to navigate between pages exist', () => {
    const prevButton = container.querySelector('#prevButton');
    const nextButton = container.querySelector('#nextButton');
    expect(prevButton).toBeTruthy();
    expect(nextButton).toBeTruthy();
  });
});

describe('test the utils file', () => {
  const { makeApiCall, debounce } = require('../../user-management/utils.js');
  it('t should make an API call and return the response', async () => {
    const url = 'https://api.realdevsquad.com/users?size=5';
    const response = {
      message: 'Users returned successfully!',
      users: [
        {
          id: '050fN6nrftHO6hWeW1YU',
          github_id: 'takshch',
          yoe: '0',
          linkedin_id: 'takshch',
          username: 'taksh',
          first_name: 'Taksh',
          incompleteUserDetails: false,
          last_name: 'Chanana',
          roles: { archived: true },
          twitter_id: 'takshchh',
          company: 'NA',
          github_display_name: 'Taksh Chanana',
          designation: 'NA',
        },
        {
          id: '07DQbggLvbZcobTDgDYP',
          yoe: 1,
          last_name: 'Srivastava',
          twitter_id: 'akkee19',
          linkedin_id: 'akash-srivastava-640aa826',
          github_id: 'akashdotsrivastava',
          username: 'akashdotsrivastava',
          first_name: 'Akash',
          designation: 'Software Engineer',
          incompleteUserDetails: false,
          roles: { archived: false },
          instagram_id: 'akkee19',
          github_display_name: 'Akash Srivastava',
        },
        {
          id: '07qNFY7fWhSBcJ8icXV7',
          first_name: 'Aditya',
          yoe: 0,
          linkedin_id: 'aditya-agrawal-2674251a3',
          roles: { archived: false },
          incompleteUserDetails: false,
          github_id: 'AdityaAgrawal-03',
          designation: 'SDE-1',
          username: 'aditya-agrawal',
          company: 'Airmeet',
          twitter_id: 'sayitaditya',
          github_display_name: 'Aditya Agrawal',
          last_name: 'Agrawal',
        },
        {
          id: '0JGMG9tBa4GCQIB1QndP',
          incompleteUserDetails: true,
          github_display_name: 'Rakesh',
          github_id: 'ra-kesh',
          roles: { archived: false },
        },
        {
          id: '0OrS8GTm6KjitGiYCNoL',
          username: 'nikhilkamat2',
          incompleteUserDetails: false,
          github_display_name: 'Nikhil Kamat',
          linkedin_id: 'nikhilkamat2',
          company: 'NetApp',
          roles: { archived: false },
          designation: 'Software Engineer ',
          first_name: 'Nikhil',
          twitter_id: 'novemberkilo17',
          github_id: 'nikhilkamat2',
          last_name: 'Kamat',
          yoe: 2,
        },
      ],
    };
    fetch.mockResponseOnce(JSON.stringify(response));
    const headers = {
      // 'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJEdFI5c0s3Q3lzT1ZIUDE3emw4TiIsImlhdCI6MTY3MTM3MTcwOSwiZXhwIjoxNjczOTYzNzA5fQ.dxe3VAFF5WqJV85iEU5yQr4tTyfq3gghnQCBmK4ypXiKAHikqF4ogyr9OlW-d_Fq9k65Y4mwD540otMnQrQzz_uhKLM96uSZVadwRLUiuvAlRXxdxxf4j_H-ZjGsJehtv7IxamCK8tcE1uZ3GOG0U0KasVoo9SyQAYRJmkM3loQgon15knEt-4Yqx67NAAvYvQX3yRtwe12COUuIKppNv7tQenqJIjkc_C-Wav3tt4_axlg8FXiAiVP5OBKpJ3W8t39ONduZpRsFwxeWCWRY5O3MqXh8K215430R5lilGPl-FRYdktvJq7376dKAVDKLDQXn828vgu8e6sWgF-0NxA',
      'content-Type': 'application/json',
      Cookie:
        'rds-session=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJEdFI5c0s3Q3lzT1ZIUDE3emw4TiIsImlhdCI6MTY3MzkxNzE0OCwiZXhwIjoxNjc2NTA5MTQ4fQ.fO-Tz-6HR5QMgfWLYN6Tp54Fpc2FgpF_YWywhXLN-g1uoWAxj8M2X59eGHImQPoL-4i7fE5yN28nzolkIphp7iz3qRKcJ4IOy9dBXBQSNo-QBbXDgqjJQ1evxP-qmW7I6AX5YJ1Uv0k11UC4eTsVgAxJjGqGh1DB5IIH1mVDnO22VoUicjr8T5nFFQCvlLJIllF8O5BqlMZeVKvkqrKgxt5Jm5Bdj9Sd94uGqOXz5WlX_KKhXXAER4MPnNyqHa5XuQDP0Cf2USChLKssTbuFoy7pppw3QUyIm6FCrdCTMa6KwBgNuyGnTfmNePfNdJWTEy-K13nKPITx7zUbmPhx7A',
    };
    const result = await makeApiCall(url, 'get', null, 'include', headers, {});
    expect(result.status).toBe(200);
    expect(result.json()).resolves.toEqual(response);
  });

  it('should call the argument function after the specified delay', () => {
    jest.useFakeTimers();
    const mockFunc = jest.fn();
    const debouncedFunc = debounce(mockFunc, 500);
    debouncedFunc();
    expect(mockFunc).not.toHaveBeenCalled();
    jest.advanceTimersByTime(450);
    expect(mockFunc).not.toHaveBeenCalled();
    jest.advanceTimersByTime(50);
    expect(mockFunc).toHaveBeenCalled();
  });

  it('should call the argument function only once', () => {
    jest.useFakeTimers();
    const mockFunc = jest.fn();
    const debouncedFunc = debounce(mockFunc, 500);
    debouncedFunc();
    jest.advanceTimersByTime(50);
    debouncedFunc();
    debouncedFunc();
    jest.advanceTimersByTime(500);
    expect(mockFunc).toHaveBeenCalledTimes(1);
  });
});
