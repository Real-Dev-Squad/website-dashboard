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

prevBtn.addEventListener('click', () => {
  showUserDataList(--page);
});

nextBtn.addEventListener('click', () => {
  showUserDataList(++page);
});

tileViewBtn.addEventListener('click', showTileView);
tableViewBtn.addEventListener('click', showTableView);

userSearchElement.addEventListener(
  'input',
  debounce((event) => {
    if (event.target.value) {
      return getParticularUserData(event.target.value);
    }
    showUserDataList(page);
  }, 500),
);

function showTileView() {
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

function showTableView() {
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

function showErrorMessage(msg) {
  userListElement.innerHTML = '';
  const paraELe = document.createElement('p');
  const textNode = document.createTextNode(msg);
  paraELe.appendChild(textNode);
  paraELe.classList.add('error-text');
  userListElement.appendChild(paraELe);
  paginationElement.classList.add('remove-element');
  paginationElement.classList.remove('pagination');
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
      if (usersDataList.length < 100) {
        nextBtn.classList.add('btn-disabled');
      } else {
        nextBtn.classList.remove('btn-disabled');
      }
      usersDataList = usersDataList.filter(
        (user) => user.first_name && !user.roles?.archived,
      );
      usersDataList = usersDataList.map((user) => ({
        first_name: user.first_name,
        last_name: user.last_name ? user.last_name : '',
        picture: user.picture && user.picture.url ? user.picture.url : '',
      }));
    }
    return usersDataList;
  } catch (err) {
    const paraELe = document.createElement('p');
    const textNode = document.createTextNode('Something Went Wrong');
    paraELe.appendChild(textNode);
    paraELe.classList.add('error-text');
    loaderElement.classList.add('remove-element');
    userListElement.appendChild(paraELe);
  }
}

function generateUserList(users, showPagination) {
  userListElement.innerHTML = '';
  if (page <= 0) {
    prevBtn.classList.add('btn-disabled');
  } else {
    prevBtn.classList.remove('btn-disabled');
  }
  if (!users || !users.length) {
    showErrorMessage('No data found');
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

async function getParticularUserData(searchInput) {
  try {
    let usersRequest = await makeApiCall(`${RDS_API_USERS}${searchInput}`);
    let usersData = await usersRequest.json();
    if (usersRequest.status === 200) {
      usersData = usersData.user;
      let data = [];
      if (usersData.first_name && !usersData.roles?.archived) {
        data.push({
          first_name: usersData.first_name,
          last_name: usersData.last_name ? usersData.last_name : '',
          picture:
            usersData.picture && usersData.picture.url
              ? usersData.picture.url
              : '',
        });
      }
      return generateUserList(data, false);
    }
    showErrorMessage(usersData.message);
    return;
  } catch (err) {
    const paraELe = document.createElement('p');
    const textNode = document.createTextNode('Something Went Wrong');
    paraELe.appendChild(textNode);
    paraELe.classList.add('error-text');
    loaderElement.classList.add('remove-element');
  }
}

async function showUserDataList(page) {
  const userData = await getUsersData(page);
  generateUserList(userData, true);
}

showUserDataList(page);
