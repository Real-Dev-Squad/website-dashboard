const userListElement = document.getElementById(USER_LIST_ELEMENT);
const loaderElement = document.getElementById(LOADER_ELEMENT);
const tileViewBtn = document.getElementById(TILE_VIEW_BTN);
const tableViewBtn = document.getElementById(TABLE_VIEW_BTN);
const userSearchElement = document.getElementById(USER_SEARCH_ELEMENT);
const paginationElement = document.getElementById(PAGINATION_ELEMENT);
const prevBtn = document.getElementById(PREV_BUTTON);
const nextBtn = document.getElementById(NEXT_BUTTON);
const filterModal = document.getElementsByClassName(FILTER_MODAL)[0];
const filterButton = document.getElementById(FILTER_BUTTON);
const availabilityFilter = document.getElementById(AVAILABILITY_FILTER);
const applyFilterButton = document.getElementById(APPLY_FILTER_BUTTON);
const clearButton = document.getElementById(CLEAR_BUTTON);

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
    const usersRequest = await makeApiCallForUsers(
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
      document.getElementById('user-search').value = '';
      window.location.href = `details/index.html?username=${userData.username}`;
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
  try {
    const usersRequest = await makeApiCallForUsers(
      `${RDS_API_USERS}?search=${searchInput}`,
    );
    const usersData = await usersRequest.json();
    return usersData;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

function formatUsersData(usersData) {
  let data = [];
  usersData.forEach((usersData) => {
    if (usersData.first_name && !usersData.roles?.archived) {
      data.push({
        first_name: usersData.first_name,
        last_name: usersData.last_name ? usersData.last_name : '',
        username: usersData.username,
        picture:
          usersData.picture && usersData.picture.url
            ? usersData.picture.url
            : '',
      });
    }
  });
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
    if (usersData.users) {
      const data = formatUsersData(usersData.users);
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

function showUserList(users) {
  const ulElement = document.createElement('ul');
  if (!users.length) {
    userListElement.innerHTML = 'No Users Found';
    return;
  }
  users.forEach((userData) => {
    const listElement = document.createElement('li');
    const imgElement = document.createElement('img');
    imgElement.src = userData.picture?.url ?? DEFAULT_AVATAR;
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
      document.getElementById('user-search').value = '';
      window.location.href = `details/index.html?username=${userData.username}`;
    };
    ulElement.appendChild(listElement);
    paginationElement.classList.add('remove-element');
    paginationElement.classList.remove('pagination');
  });

  userListElement.innerHTML = '';
  userListElement.appendChild(ulElement);
}

function displayLoader() {
  userListElement.innerHTML = '';
  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.className = 'loader';
  userListElement.appendChild(loader);
}

function clearFilters() {
  availabilityFilter.value = 'none';
  displayLoader();
  showUserDataList(
    page,
    userListElement,
    paginationElement,
    loaderElement,
    prevBtn,
    nextBtn,
  );
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
    const userData = await getUsersData(page);
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

function addCheckbox(labelText, value, groupName) {
  const group = document.getElementById(groupName);
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = groupName;
  checkbox.value = value;
  label.innerHTML = checkbox.outerHTML + '&nbsp;' + labelText;
  label.classList.add('checkbox-label');
  label.appendChild(document.createElement('br'));
  group.appendChild(label);
}

function populateSkills(skills) {
  for (let i = 0; i < skills.length; i++) {
    const { name, id } = skills[i];
    addCheckbox(name, id, 'skills-filter');
  }
}
function populateAvailability() {
  const availabilityArr = [
    { name: 'Active', id: 'ACTIVE' },
    { name: 'Ooo (Out of Office)', id: 'OOO' },
    { name: 'Idle', id: 'IDLE' },
  ];
  for (let i = 0; i < availabilityArr.length; i++) {
    const { name, id } = availabilityArr[i];
    addCheckbox(name, id, 'availability-filter');
  }
}

const populateFilters = () => {
  populateAvailability();
  generateSkills();
};
async function getUsersSkills() {
  try {
    const usersRequest = await makeApiCallForUsers(RDS_API_SKILLS);
    let usersSkillList = [];
    if (usersRequest.status === 200) {
      usersSkillList = await usersRequest.json();
      usersSkillList = usersSkillList.tags;
    } else {
      throw new Error(
        `User list request failed with status: ${usersRequest.status}`,
      );
    }
    return usersSkillList;
  } catch (err) {
    throw err;
  }
}

async function generateSkills() {
  const allSkills = await getUsersSkills();
  const allSkillTags = allSkills
    .map(({ type, name, id }) => {
      if (type === 'SKILL') {
        return { name, id };
      }
    })
    .filter((tag) => tag != undefined);
  populateSkills(allSkillTags);
}

window.onload = function () {
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
  populateFilters();
};

filterButton.addEventListener('click', (event) => {
  event.stopPropagation();
  filterModal.classList.toggle('hidden');
});

function getCheckedValues(groupName) {
  const checkboxes = document.querySelectorAll(
    `input[name="${groupName}"]:checked`,
  );
  return Array.from(checkboxes).map((cb) => cb.value);
}

function getFilteredUsersURL(checkedValuesSkills, checkedValuesAvailability) {
  const params = new URLSearchParams();

  checkedValuesSkills.forEach((skill) => {
    params.append('tagId', skill);
  });

  checkedValuesAvailability.forEach((availability) => {
    params.append('state', availability);
  });

  return `?${params.toString()}`;
}

applyFilterButton.addEventListener('click', async () => {
  filterModal.classList.toggle('hidden');
  displayLoader();
  const checkedValuesSkills = getCheckedValues('skills-filter');
  const checkedValuesAvailability = getCheckedValues('availability-filter');
  const queryParams = getFilteredUsersURL(
    checkedValuesSkills,
    checkedValuesAvailability,
  );
  try {
    const usersRequest = await makeApiCallForUsers(
      `${RDS_API_USERS}/search${queryParams}`,
    );
    const { users } = await usersRequest.json();
    showUserList(users);
  } catch (err) {
    throw new Error(`User list request failed with error: ${err}`);
  }
});

function clearCheckboxes(name) {
  const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
  checkboxes.forEach((cb) => {
    cb.checked = false;
  });
}

clearButton.addEventListener('click', function () {
  clearCheckboxes('skills-filter');
  clearCheckboxes('availability-filter');
  filterModal.classList.toggle('hidden');
  displayLoader();
  showUserDataList(
    page,
    userListElement,
    paginationElement,
    loaderElement,
    prevBtn,
    nextBtn,
  );
});

filterModal.addEventListener('click', (event) => {
  event.stopPropagation();
});

window.onclick = function () {
  filterModal.classList.add('hidden');
};

export {
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
};
