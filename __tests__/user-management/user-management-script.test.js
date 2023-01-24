const allFns = require('../../user/script');
const {
  init,
  showTileView,
  showErrorMessage,
  showTableView,
  getUsersData,
  generateUserList,
  getParticularUserData,
  // fetchUsersData,
  formatUsersData,
} = allFns;
import fetchMock from 'jest-fetch-mock';

describe('test the script js file for user listing screen', () => {
  const API_BASE_URL = 'https://api.realdevsquad.com';
  const RDS_API_USERS = `${API_BASE_URL}/users/`;
  const USER_LIST_ELEMENT = 'user-list';
  const LOADER_ELEMENT = 'loader';
  const TILE_VIEW_BTN = 'tile-view-btn';
  const TABLE_VIEW_BTN = 'table-view-btn';
  const USER_SEARCH_ELEMENT = 'user-search';
  const DEFAULT_AVATAR = './images/avatar.png';
  const PAGINATION_ELEMENT = 'pagination';
  const PREV_BUTTON = 'prevButton';
  const NEXT_BUTTON = 'nextButton';
  const USER_FETCH_COUNT = 100;
  test('should add click event listeners to the prevBtn and nextBtn', () => {
    const prevBtn = document.createElement('button');
    prevBtn.id = PREV_BUTTON;
    prevBtn.addEventListener = jest.fn();
    const nextBtn = document.createElement('button');
    nextBtn.id = NEXT_BUTTON;
    nextBtn.addEventListener = jest.fn();
    const tileViewBtn = document.createElement('button');
    tileViewBtn.id = TILE_VIEW_BTN;
    tileViewBtn.addEventListener = jest.fn();
    const tableViewBtn = document.createElement('button');
    tableViewBtn.id = TABLE_VIEW_BTN;
    tableViewBtn.addEventListener = jest.fn();
    const userSearchElement = document.createElement('input');
    userSearchElement.id = USER_SEARCH_ELEMENT;
    userSearchElement.addEventListener = jest.fn();
    const userListElement = document.createElement('ul');
    userListElement.id = USER_LIST_ELEMENT;
    const paginationElement = document.createElement('div');
    paginationElement.id = PAGINATION_ELEMENT;
    const loaderElement = document.createElement('div');
    loaderElement.id = LOADER_ELEMENT;

    init(
      prevBtn,
      nextBtn,
      tileViewBtn,
      tableViewBtn,
      userSearchElement,
      userListElement,
      paginationElement,
      loaderElement,
    );

    expect(prevBtn.addEventListener.mock.calls.length).toBe(1);
    expect(prevBtn.addEventListener.mock.calls[0][0]).toBe('click');
    expect(nextBtn.addEventListener.mock.calls.length).toBe(1);
    expect(nextBtn.addEventListener.mock.calls[0][0]).toBe('click');
    expect(tileViewBtn.addEventListener.mock.calls.length).toBe(1);
    expect(tileViewBtn.addEventListener.mock.calls[0][0]).toBe('click');
    expect(tableViewBtn.addEventListener.mock.calls.length).toBe(1);
    expect(tableViewBtn.addEventListener.mock.calls[0][0]).toBe('click');
    expect(userSearchElement.addEventListener.mock.calls.length).toBe(1);
    expect(userSearchElement.addEventListener.mock.calls[0][0]).toBe('input');
  });

  test('should add the "tile-view" class to the userList Elements and remove the "table-view" class', () => {
    const userListElement = document.createElement('div');
    userListElement.id = USER_LIST_ELEMENT;
    const ulElement = document.createElement('ul');
    const tableViewBtn = document.createElement('button');
    tableViewBtn.classList.add('btn-active');
    const tileViewBtn = document.createElement('button');
    const listElement = document.createElement('li');
    const imgElement = document.createElement('img');
    imgElement.src = DEFAULT_AVATAR;
    const pElement = document.createElement('p');
    const node = document.createTextNode('Test User');
    pElement.appendChild(node);
    listElement.appendChild(imgElement);
    listElement.appendChild(pElement);
    ulElement.appendChild(listElement);
    userListElement.appendChild(ulElement);

    showTileView(userListElement, tableViewBtn, tileViewBtn);
    expect(tableViewBtn.classList.contains('btn-active')).toBe(false);
    expect(tileViewBtn.classList.contains('btn-active')).toBe(true);
    expect(listElement.classList.contains('tile-width')).toBe(true);
    expect(imgElement.classList.contains('remove-element')).toBe(true);
  });

  test('should add the "table-view" class to the userList Elements and remove the "tile-view" class', () => {
    const userListElement = document.createElement('div');
    userListElement.id = USER_LIST_ELEMENT;
    const ulElement = document.createElement('ul');
    const tableViewBtn = document.createElement('button');
    tableViewBtn.classList.add('btn-active');
    const tileViewBtn = document.createElement('button');
    const listElement = document.createElement('li');
    const imgElement = document.createElement('img');
    imgElement.src = DEFAULT_AVATAR;
    const pElement = document.createElement('p');
    const node = document.createTextNode('Test User');
    pElement.appendChild(node);
    listElement.appendChild(imgElement);
    listElement.appendChild(pElement);
    ulElement.appendChild(listElement);
    userListElement.appendChild(ulElement);

    showTableView(userListElement, tableViewBtn, tileViewBtn);

    expect(tableViewBtn.classList.contains('btn-active')).toBe(true);
    expect(tileViewBtn.classList.contains('btn-active')).toBe(false);
    expect(listElement.classList.contains('tile-width')).toBe(false);
    expect(imgElement.classList.contains('remove-element')).toBe(false);
  });

  test('should add an error message to the userListElement', () => {
    const userListElement = document.createElement('ul');
    const paginationElement = document.createElement('div');
    paginationElement.id = PAGINATION_ELEMENT;
    const loaderElement = document.createElement('div');
    loaderElement.id = LOADER_ELEMENT;
    showErrorMessage(
      'Error: Unable to fetch user data.',
      userListElement,
      paginationElement,
      loaderElement,
    );
    expect(userListElement.childElementCount).toBe(1);
    expect(userListElement.innerHTML).toBe(
      '<p class="error-text">Error: Unable to fetch user data.</p>',
    );
  });

  test('getUsersData returns the correct data for a successful API call', async () => {
    const mockData = {
      users: [
        { id: 1, name: 'Ritvik Jamwal' },
        { id: 2, name: 'Mahima Bansal' },
      ],
    };

    fetchMock.enableMocks();
    fetchMock.mockResponseOnce(JSON.stringify(mockData));

    const result = await getUsersData(1);
    expect(result).toEqual(mockData.users);
    fetchMock.resetMocks();
  });

  test('generateUserList creates a list of users and shows pagination', () => {
    const users = [
      {
        first_name: 'Ritvik',
        last_name: 'Jamwal',
        picture: 'https://picsum.photos/200',
        username: 'ritvik',
      },
      {
        first_name: 'Mahima',
        last_name: 'Bansal',
        picture: 'https://picsum.photos/200',
        username: 'mahima',
      },
    ];
    const userListElement = document.createElement('div');
    const paginationElement = document.createElement('div');
    const loaderElement = document.createElement('div');
    const prevBtn = document.createElement('button');

    let showPagination = true;
    generateUserList(
      users,
      showPagination,
      userListElement,
      paginationElement,
      loaderElement,
      prevBtn,
    );
    expect(userListElement.innerHTML).toContain('Ritvik Jamwal');
    expect(userListElement.innerHTML).toContain('Mahima Bansal');
    expect(paginationElement.classList.contains('remove-element')).toBe(false);
    expect(paginationElement.classList.contains('pagination')).toBe(true);

    showPagination = false;
    generateUserList(
      users,
      showPagination,
      userListElement,
      paginationElement,
      loaderElement,
      prevBtn,
    );
    expect(userListElement.innerHTML).toContain('Ritvik Jamwal');
    expect(userListElement.innerHTML).toContain('Mahima Bansal');
    expect(paginationElement.classList.contains('remove-element')).toBe(true);
    expect(paginationElement.classList.contains('pagination')).toBe(false);

    showPagination = true;
    generateUserList(
      [],
      showPagination,
      userListElement,
      paginationElement,
      loaderElement,
      prevBtn,
    );
    expect(userListElement.innerHTML).toContain('No data found');
    expect(paginationElement.classList.contains('remove-element')).toBe(true);
  });
  test('fetchUsersData should return user data', async () => {
    const { fetchUsersData } = allFns;
    const mockData = {
      id: 'DtRsdsK7CysOV7zl8N23s',
      name: 'Mahima Bansal',
      email: 'mahimabansal@bansalclasses.com',
    };
    const mockFetch = jest.fn().mockResolvedValue({ json: () => mockData });
    global.fetch = mockFetch;
    const searchInput = 'mahima';
    const result = await fetchUsersData(searchInput);
    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith(`${RDS_API_USERS}${searchInput}`, {
      method: 'get',
      body: null,
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
    });
  });

  test('formatUsersData should return formatted user info', () => {
    const usersData = {
      first_name: 'Mahima',
      last_name: 'Bansal',
      picture: { url: 'https://picsum.photos/200' },
      roles: { archived: false },
    };

    const expectedData = [
      {
        first_name: 'Mahima',
        last_name: 'Bansal',
        picture: 'https://picsum.photos/200',
      },
    ];

    const result = formatUsersData(usersData);
    expect(result).toEqual(expectedData);
  });

  test('formatUsersData should not return info if first_name is not present', () => {
    const usersData = {
      last_name: 'Bansal',
      picture: { url: 'https://picsum.photos/200' },
      roles: { archived: false },
    };

    const expectedData = [];

    const result = formatUsersData(usersData);
    expect(result).toEqual(expectedData);
  });

  test('formatUsersData should not return info if roles.archived is true', () => {
    const usersData = {
      first_name: 'Mahima',
      last_name: 'Bansal',
      picture: { url: 'https://picsum.photos/200' },
      roles: { archived: true },
    };

    const expectedData = [];

    const result = formatUsersData(usersData);
    expect(result).toEqual(expectedData);
  });
});
