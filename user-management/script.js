/* 
const { RDS_API_USERS, USER_LIST_ELEMENT, LOADER_ELEMENT, TILE_VIEW_BTN, TABLE_VIEW_BTN, USER_SEARCH_ELEMENT, DEFAULT_AVATAR, PAGINATION_ELEMENT, PREV_BUTTON, NEXT_BUTTON, USER_FETCH_COUNT } = require('./constants')
const { makeApiCall, debounce } = require('./utils')
 */

// Temporarily adding the constants and utils functionalities to make tests pass
/* 
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

async function makeApiCall(
  url,
  method = 'get',
  body = null,
  credentials = 'include',
  headers = { 'content-type': 'application/json' },
  options = null,
) {
  try {
    const response = await fetch(url, {
      method,
      body,
      headers,
      credentials,
      ...options,
    });
    return response;
  } catch (err) {
    console.error('Something went wrong. Please contact admin', err);
    return err;
  }
}

function debounce(func, delay) {
  let timerId;
  return (...args) => {
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
 */
//
const userListElement = document.getElementById(USER_LIST_ELEMENT);
const loaderElement = document.getElementById(LOADER_ELEMENT);
const tileViewBtn = document.getElementById(TILE_VIEW_BTN);
const tableViewBtn = document.getElementById(TABLE_VIEW_BTN);
const userSearchElement = document.getElementById(USER_SEARCH_ELEMENT);
const paginationElement = document.getElementById(PAGINATION_ELEMENT);
const prevBtn = document.getElementById(PREV_BUTTON);
const nextBtn = document.getElementById(NEXT_BUTTON);

let tileViewActive = false;
let tableViewActive = true;
let page = 0;

const init = (
  prevBtn,
  nextBtn,
  tileViewBtn,
  tableViewBtn,
  userSearchElement,
  userListElement,
  paginationElement,
  loaderElement,
) => {
  prevBtn.addEventListener('click', () => {
    showUserDataList(
      --page,
      userListElement,
      paginationElement,
      loaderElement,
      prevBtn,
      nextBtn,
    );
  });

  nextBtn.addEventListener('click', () => {
    showUserDataList(
      ++page,
      userListElement,
      paginationElement,
      loaderElement,
      prevBtn,
      nextBtn,
    );
  });

  tileViewBtn.addEventListener('click', () => {
    showTileView(userListElement, tableViewBtn, tileViewBtn);
  });
  tableViewBtn.addEventListener('click', () => {
    showTableView(userListElement, tableViewBtn, tileViewBtn);
  });

  userSearchElement.addEventListener(
    'input',
    debounce((event) => {
      if (event.target.value) {
        return getParticularUserData(
          event.target.value,
          userListElement,
          paginationElement,
          loaderElement,
          prevBtn,
        );
      }
      showUserDataList(
        page,
        userListElement,
        paginationElement,
        loaderElement,
        prevBtn,
        nextBtn,
      );
    }, 500),
  );
};

function showTileView(userListElement, tableViewBtn, tileViewBtn) {
  tableViewActive = false;
  tileViewActive = true;
  tableViewBtn.classList.remove('btn-active');
  tileViewBtn.classList.add('btn-active');
  const listContainerElement = userListElement.lastChild;
  listContainerElement.childNodes.forEach((listElement) => {
    const imgElement = listElement.firstChild;
    imgElement.classList.add('remove-element');
    listElement.classList.add('tile-width');
  });
}

function showTableView(userListElement, tableViewBtn, tileViewBtn) {
  tableViewActive = true;
  tileViewActive = false;
  tileViewBtn.classList.remove('btn-active');
  tableViewBtn.classList.add('btn-active');
  const listContainerElement = userListElement.lastChild;
  listContainerElement.childNodes.forEach((listElement) => {
    const imgElement = listElement.firstChild;
    imgElement.classList.remove('remove-element');
    listElement.classList.remove('tile-width');
  });
}

function showErrorMessage(
  msg,
  userListElement,
  paginationElement,
  loaderElement,
) {
  userListElement.innerHTML = '';
  const paraELe = document.createElement('p');
  const textNode = document.createTextNode(msg);
  paraELe.appendChild(textNode);
  paraELe.classList.add('error-text');
  userListElement.appendChild(paraELe);
  paginationElement.classList.add('remove-element');
  paginationElement.classList.remove('pagination');
  loaderElement.classList.add('remove-element');
}

async function getUsersData(page) {
  try {
    const usersRequest = await makeApiCall(
      `${RDS_API_USERS}?size=${USER_FETCH_COUNT}&page=${page}`,
    );
    let usersDataList = [];
    if (usersRequest.status === 200) {
      usersDataList = await usersRequest.json();
      usersDataList = usersDataList.users;
    } else {
      throw new Error(
        `User list request failed with status: ${usersRequest.status}`,
      );
    }
    return usersDataList;
  } catch (err) {
    throw err;
  }
}

function generateUserList(
  users,
  showPagination,
  userListElement,
  paginationElement,
  loaderElement,
  prevBtn,
) {
  userListElement.innerHTML = '';
  if (page <= 0) {
    prevBtn.classList.add('btn-disabled');
  } else {
    prevBtn.classList.remove('btn-disabled');
  }
  if (!users || !users.length) {
    showErrorMessage(
      'No data found',
      userListElement,
      paginationElement,
      loaderElement,
    );
    return;
  }
  const ulElement = document.createElement('ul');
  users.forEach((userData) => {
    const listElement = document.createElement('li');
    const imgElement = document.createElement('img');
    imgElement.src = userData.picture ? userData.picture : DEFAULT_AVATAR;
    imgElement.classList.add('user-img-dimension');
    const pElement = document.createElement('p');
    const node = document.createTextNode(
      `${userData.first_name} ${userData.last_name}`,
    );
    pElement.appendChild(node);
    listElement.appendChild(imgElement);
    listElement.appendChild(pElement);

    if (tileViewActive) {
      let imgElement = listElement.firstChild;
      listElement.classList.remove('tile-width');
      imgElement.classList.add('remove-element');
    }
    listElement.onclick = () => {
      window.location.href = `user-details/index.html?username=${userData.username}`;
    };
    ulElement.appendChild(listElement);
  });
  loaderElement.classList.add('remove-element');
  if (showPagination) {
    paginationElement.classList.remove('remove-element');
    paginationElement.classList.add('pagination');
  } else {
    paginationElement.classList.add('remove-element');
    paginationElement.classList.remove('pagination');
  }
  userListElement.appendChild(ulElement);
}

async function fetchUsersData(searchInput) {
  const usersRequest = await makeApiCall(`${RDS_API_USERS}${searchInput}`);
  const usersData = await usersRequest.json();
  return usersData;
}

function formatUsersData(usersData) {
  let data = [];
  if (usersData.first_name && !usersData.roles?.archived) {
    data.push({
      first_name: usersData.first_name,
      last_name: usersData.last_name ? usersData.last_name : '',
      picture:
        usersData.picture && usersData.picture.url ? usersData.picture.url : '',
    });
  }
  return data;
}

async function getParticularUserData(
  searchInput,
  userListElement,
  paginationElement,
  loaderElement,
  prevBtn,
) {
  try {
    const usersData = await fetchUsersData(searchInput);
    if (usersData.user) {
      const data = formatUsersData(usersData.user);
      generateUserList(
        data,
        false,
        userListElement,
        paginationElement,
        loaderElement,
        prevBtn,
      );
    } else {
      showErrorMessage(
        usersData.message,
        userListElement,
        paginationElement,
        loaderElement,
      );
    }
  } catch (err) {
    showErrorMessage(
      'Something Went Wrong',
      userListElement,
      paginationElement,
      loaderElement,
    );
  }
}

async function showUserDataList(
  page,
  userListElement,
  paginationElement,
  loaderElement,
  prevBtn,
  nextBtn,
) {
  try {
    const userData = await getUsersData(
      page,
      userListElement,
      paginationElement,
      loaderElement,
    );
    if (userData.length) {
      if (userData.length < 100) {
        nextBtn.classList.add('btn-disabled');
      } else {
        nextBtn.classList.remove('btn-disabled');
      }
      let usersDataList = userData.filter(
        (user) => user.first_name && !user.roles?.archived,
      );
      usersDataList = usersDataList.map((user) => ({
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name ? user.last_name : '',
        picture: user.picture && user.picture.url ? user.picture.url : '',
      }));
      generateUserList(
        usersDataList,
        true,
        userListElement,
        paginationElement,
        loaderElement,
        prevBtn,
      );
    }
  } catch (err) {
    console.error(err);
    showErrorMessage(
      err.message,
      userListElement,
      paginationElement,
      loaderElement,
    );
  }
}

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
showUserDataList(
  page,
  userListElement,
  paginationElement,
  loaderElement,
  prevBtn,
  nextBtn,
);

/* export {
  init,
  showTileView,
  showTableView,
  showErrorMessage,
  getUsersData,
  generateUserList,
  getParticularUserData,
  fetchUsersData,
  formatUsersData,
  showUserDataList,
}; */

// module.exports = {
//   init,
//   showTileView,
//   showTableView,
//   showErrorMessage,
//   getUsersData,
//   generateUserList,
//   getParticularUserData,
//   fetchUsersData,
//   formatUsersData,
// };
