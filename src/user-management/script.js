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
  removeClass(listContainerElement, 'table-view');
  addClass(listContainerElement, 'tile-view');
  listContainerElement.childNodes.forEach((listElement) => {
    const imgElement = listElement.firstChild;
    addClass(imgElement, 'element-display-remove');
    addClass(listElement, 'tile-width');
  });
}

function showTableView() {
  tableViewActive = true;
  tileViewActive = false;
  tileViewBtn.classList.remove('btn-active');
  tableViewBtn.classList.add('btn-active');
  const listContainerElement = userListElement.lastChild;
  removeClass(listContainerElement, 'tile-view');
  addClass(listContainerElement, 'table-view');
  listContainerElement.childNodes.forEach((listElement) => {
    const imgElement = listElement.firstChild;
    removeClass(imgElement, 'element-display-remove');
    removeClass(listElement, 'tile-width');
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
    addClass(paraELe, 'error-text');
    addClass(loaderElement, 'element-display-remove');
    userListElement.appendChild(paraELe);
  }
}

async function generateUserList(users) {
  userListElement.innerHTML = '';
  if (!users.length) {
    const paraELe = document.createElement('p');
    const textNode = document.createTextNode('No data found');
    paraELe.appendChild(textNode);
    addClass(paraELe, 'error-text');
    userListElement.appendChild(paraELe);
    return;
  }
  const ulElement = document.createElement('ul');
  users.forEach((userData) => {
    const listElement = document.createElement('li');
    const imgElement = document.createElement('img');
    imgElement.src = userData.picture ? userData.picture : defaultAvatar;
    addClass(imgElement, 'user-img-dimension');
    const pElement = document.createElement('p');
    const node = document.createTextNode(
      `${userData.first_name} ${userData.last_name}`,
    );
    pElement.appendChild(node);
    listElement.appendChild(imgElement);
    listElement.appendChild(pElement);
    addClass(ulElement, 'table-view');
    if (tileViewActive) {
      let imgElement = listElement.firstChild;
      removeClass(ulElement, 'table-view');
      addClass(ulElement, 'tile-view');
      removeClass(listElement, 'tile-width');
      addClass(imgElement, 'element-display-remove');
    }
    ulElement.appendChild(listElement);
  });
  addClass(loaderElement, 'element-display-remove');
  userListElement.appendChild(ulElement);
}

function filterUsers(searchInput) {
  usersListfilter = usersDataList.filter((user) => {
    const name = `${user.first_name}  ${user.last_name ?? ''}`;
    return name.trim().toLowerCase().includes(searchInput.toLowerCase());
  });
  generateUserList(usersListfilter);
}

getUsersData();
