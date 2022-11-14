const userListElement = document.getElementById(USER_LIST_ELEMENT);
const loaderElement = document.getElementById(LOADER_ELEMENT);
const tileViewBtn = document.getElementById(TILE_VIEW_BTN);
const tableViewBtn = document.getElementById(TABLE_VIEW_BTN);
const userSearchElement = document.getElementById(USER_SEARCH_ELEMENT);

let tileViewActive = false;
let tableViewActive = true;

tileViewBtn.addEventListener('click', showTileView);
tableViewBtn.addEventListener('click', showTableView);

function showTileView() {
  tableViewActive = false;
  tileViewActive = true;
  tableViewBtn.classList.remove('btn-active');
  tileViewBtn.classList.add('btn-active');
  const listContainerElement = userListElement.lastChild;
  listContainerElement.classList.remove('table-view');
  listContainerElement.classList.add('tile-view');

  listContainerElement.childNodes.forEach((listElement) => {
    const imgElement = listElement.firstChild;
    imgElement.classList.add('element-display-remove');
    listElement.classList.add('tile-width');
  });
}

function showTableView() {
  tableViewActive = true;
  tileViewActive = false;
  tileViewBtn.classList.remove('btn-active');
  tableViewBtn.classList.add('btn-active');
  const listContainerElement = userListElement.lastChild;
  listContainerElement.classList.remove('tile-view');
  listContainerElement.classList.add('table-view');
  listContainerElement.childNodes.forEach((listElement) => {
    const imgElement = listElement.firstChild;
    imgElement.classList.remove('element-display-remove');
    listElement.classList.remove('tile-width');
  });
}

userSearchElement.addEventListener(
  'input',
  debounce((event) => filterUsers(event.target.value), 500),
);

let usersDataList = [];

async function getUsersData() {
  try {
    const usersRequest = await makeApiCall(RDS_API_USERS);
    if (usersRequest.status === 200) {
      usersDataList = await usersRequest.json();
      usersDataList = usersDataList.users;
      usersDataList = usersDataList.filter((user) => user.first_name);
      usersDataList = usersDataList.map((user) => ({
        first_name: user.first_name,
        last_name: user.last_name ? user.last_name : '',
        picture: user.picture && user.picture.url ? user.picture.url : '',
      }));
    }
    generateUserList(usersDataList);
  } catch (err) {
    const paraELe = document.createElement('p');
    const textNode = document.createTextNode('Something Went Wrong');
    paraELe.appendChild(textNode);
    paraELe.classList.add('error-text');
    loaderElement.classList.add('element-display-remove');
    userListElement.appendChild(paraELe);
  }
}

async function generateUserList(users) {
  userListElement.innerHTML = '';
  if (!users.length) {
    const paraELe = document.createElement('p');
    const textNode = document.createTextNode('No data found');
    paraELe.appendChild(textNode);
    paraELe.classList.add('error-text');
    userListElement.appendChild(paraELe);
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
    ulElement.classList.add('table-view');

    if (tileViewActive) {
      let imgElement = listElement.firstChild;
      ulElement.classList.remove('table-view');
      ulElement.classList.add('tile-view');
      listElement.classList.remove('tile-width');
      imgElement.classList.add('element-display-remove');
    }
    ulElement.appendChild(listElement);
  });
  loaderElement.classList.add('element-display-remove');

  userListElement.appendChild(ulElement);
}

function filterUsers(searchInput) {
  usersListfilter = usersDataList.filter((user) => {
    const name = `${user.first_name}${user.last_name ?? ''}`;
    return name
      .trim()
      .toLowerCase()
      .split(' ')
      .join('')
      .includes(searchInput.toLowerCase().split(' ').join(''));
  });
  generateUserList(usersListfilter);
}

getUsersData();
