const params = new URLSearchParams(window.location.search);
const userListElement = document.getElementById(USER_LIST_ELEMENT);
const loaderElement = document.getElementById(LOADER_ELEMENT);
const userloaderElement = document.getElementById(USER_LOADER_ELEMENT);
const tileViewBtn = document.getElementById(TILE_VIEW_BTN);
const tableViewBtn = document.getElementById(TABLE_VIEW_BTN);
const userSearchElement = document.getElementById(USER_SEARCH_ELEMENT);
const filterModal = document.getElementsByClassName(FILTER_MODAL)[0];
const filterButton = document.getElementById(FILTER_BUTTON);
const availabilityFilter = document.getElementById(AVAILABILITY_FILTER);
const applyFilterButton = document.getElementById(APPLY_FILTER_BUTTON);
const clearButton = document.getElementById(CLEAR_BUTTON);
const ulElement = document.getElementById(HEAD_LIST_ELEMENT);

let tileViewActive = false;
let tableViewActive = true;
let isLoading = false;
let page = 0;
let run = true;

const init = (
  tileViewBtn,
  tableViewBtn,
  userSearchElement,
  userListElement,
  loaderElement,
) => {
  window.addEventListener('scroll', async () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      run
    ) {
      if (!page) {
        page++;
        return;
      }

      run = false;
      showUserDataList(
        page++,
        userListElement,

        loaderElement,
      );
    }
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
          loaderElement,
        );
      }
      showUserDataList(page, userListElement, loaderElement);
    }, 500),
  );
};

function showTileView(userListElement, tableViewBtn, tileViewBtn) {
  tableViewActive = false;
  tileViewActive = true;
  tableViewBtn.classList.remove('btn-active');
  tileViewBtn.classList.add('btn-active');
  const listContainerElement = userListElement.lastChild;
  const headList = document.getElementById('head_list');
  headList.classList.add('tile-webview');
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
  const headList = document.getElementById('head_list');
  headList.classList.remove('tile-webview');
  listContainerElement.childNodes.forEach((listElement) => {
    const imgElement = listElement.firstChild;
    imgElement.classList.remove('remove-element');
    listElement.classList.remove('tile-width');
  });
}

function showErrorMessage(msg, userListElement, loaderElement) {
  userListElement.innerHTML = '';
  const paraELe = document.createElement('p');
  const textNode = document.createTextNode(msg);
  paraELe.appendChild(textNode);
  paraELe.id = 'error_para';
  paraELe.classList.add('error-text');
  userListElement.appendChild(paraELe);
  loaderElement.classList.add('remove-element');
}

const getUsersData = async (page) => {
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
};

function generateUserList(
  users,
  showPagination,
  userListElement,
  loaderElement,
) {
  if (!users || !users.length) {
    showErrorMessage('No data found', userListElement, loaderElement);
    return;
  }

  const errorTexts = document.getElementById('error_para');
  if (errorTexts) {
    errorTexts.remove();
  }

  if (showPagination || page == 0) {
    ulElement.innerHTML = '';
  }

  if (users?.length) {
    users?.forEach((userData) => {
      const listElement = document.createElement('li');
      const imgElement = document.createElement('img');
      imgElement.src = userData.picture ? userData.picture : DEFAULT_AVATAR;
      imgElement.classList.add('user-img-dimension');
      listElement.classList.add('tile-webview');
      const pElement = document.createElement('p');
      const node = document.createTextNode(
        `${userData.first_name} ${userData.last_name}`,
      );
      pElement.appendChild(node);
      listElement.appendChild(imgElement);
      listElement.appendChild(pElement);

      if (tileViewActive) {
        let imgElement = listElement.firstChild;
        listElement.classList.add('tile-width');
        imgElement.classList.add('remove-element');
      }
      listElement.onclick = () => {
        document.getElementById('user-search').value = '';
        window.location.href = `/users/details/index.html?username=${userData.username}`;
      };
      ulElement.appendChild(listElement);
    });
    loaderElement.classList.add('remove-element');
    userListElement.appendChild(ulElement);
    run = true;
    if (document.getElementById('loader')) {
      document.getElementById('loader').classList.add('remove-element');
    }
  }
}

async function fetchUsersData(searchInput) {
  try {
    const usersRequest = await makeApiCall(
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
  loaderElement,
) {
  try {
    page = 0;
    if (!searchInput.length) {
      await showUserDataList(page, userListElement, loaderElement);
      return;
    }
    const usersData = await fetchUsersData(searchInput);
    if (usersData.users) {
      const data = formatUsersData(usersData?.users);

      generateUserList(data, true, userListElement, loaderElement);
    } else {
      showErrorMessage(usersData.message, userListElement, loaderElement);
    }
  } catch (err) {
    showErrorMessage('Something Went Wrong', userListElement, loaderElement);
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
      window.location.href = `/users/details/index.html?username=${userData.username}`;
    };
    ulElement.appendChild(listElement);
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
  showUserDataList(page, userListElement, loaderElement);
}

const showUserDataList = async (
  page,
  userListElement,

  loaderElement,
) => {
  try {
    if (isLoading) return;
    if (page != 0) {
      isLoading = true;
      userloaderElement.style.display = 'block';
    }

    const userData = await getUsersData(page);
    if (userData && userData.length) {
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
        false,
        userListElement,

        loaderElement,
      );
    }
  } catch (err) {
    console.error(err);
    showErrorMessage(
      err.message,
      userListElement,

      loaderElement,
    );
  } finally {
    userloaderElement.style.display = 'none';
    isLoading = false;
  }
};

function addCheckbox(labelText, value, groupName) {
  const group = document.getElementById(groupName);
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = groupName;
  checkbox.value = value;
  checkbox.id = value;
  checkbox.className = 'checkbox';
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
    { name: 'Onboarding', id: 'ONBOARDING' },
    { name: 'Onboarding > 31d', id: 'ONBOARDING31DAYS' },
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
    const usersRequest = await makeApiCall(RDS_API_SKILLS);
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
    tileViewBtn,
    tableViewBtn,
    userSearchElement,
    userListElement,
    loaderElement,
  );
  showUserDataList(page, userListElement, loaderElement);

  populateFilters();
  if (window.location.search) {
    persistUserDataBasedOnQueryParams();
  }
};

filterButton.addEventListener('click', (event) => {
  event.stopPropagation();
  filterModal.classList.toggle('hidden');

  if (window.location.search) {
    const checkboxes = document.querySelectorAll('.checkbox');
    selectFiltersBasedOnQueryParams(checkboxes);
  }
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

function manipulateQueryParamsToURL(constructedQueryParam) {
  const currentURLInstance = new URL(window.location.href);
  currentURLInstance.search = '';
  const currentURL = currentURLInstance.href;
  if (constructedQueryParam) {
    const newURLWithQueryParams = `${currentURL}${constructedQueryParam}`;
    window.history.pushState(
      { path: newURLWithQueryParams },
      '',
      newURLWithQueryParams,
    );
  } else {
    const newUrlWithoutQueryParams = `${currentURL}`;
    window.history.pushState(
      { path: newUrlWithoutQueryParams },
      '',
      newUrlWithoutQueryParams,
    );
  }
}

/**
 * Parses the query parameters from the current URL and organizes them into an object.
 *
 * @function
 * @returns {Object.<string, string[]>} An object containing query parameter keys as properties
 * and arrays of corresponding values. Values are either in uppercase (for 'state') or as provided in the URL.
 */
function parseQueryParams() {
  // Create a new URL object instance based on the current URL of the web page.
  const urlObjInstance = new URL(window.location.href);
  // Get an iterator for the query parameters.
  const queryParamsObj = urlObjInstance.searchParams.entries();
  // Create an empty object to store the parsed query parameters.
  const queryObject = {};
  for (const [key, value] of queryParamsObj) {
    if (!queryObject[key]) {
      queryObject[key] = [];
    }
    if (key === 'state') {
      queryObject[key].push(value.toLocaleUpperCase());
    } else {
      queryObject[key].push(value);
    }
  }
  // Return the parsed query parameters object
  return queryObject;
}

function selectFiltersBasedOnQueryParams(filters) {
  const parsedQuery = parseQueryParams();

  filters.forEach((filter) => {
    for (const key in parsedQuery) {
      if (parsedQuery.hasOwnProperty(key)) {
        if (parsedQuery[key].includes(filter.id)) {
          filter.checked = true;
          break;
        }
      }
    }
  });
}

async function persistUserDataBasedOnQueryParams() {
  const parsedQuery = parseQueryParams();
  const urlSearchParams = new URLSearchParams();
  for (const key in parsedQuery) {
    for (const value of parsedQuery[key]) {
      urlSearchParams.append(key, encodeURIComponent(value));
    }
  }
  const queryString = urlSearchParams.toString();

  try {
    const usersRequest = await makeApiCall(
      `${RDS_API_USERS}/search?${queryString}`,
    );
    const { users } = await usersRequest.json();
    showUserList(users);
  } catch (err) {
    throw new Error(`User list request failed with error: ${err}`);
  }
}

// Function to apply the filter when the "Apply Filter" button is clicked
applyFilterButton.addEventListener('click', async () => {
  filterModal.classList.toggle('hidden');
  displayLoader();
  const checkedValuesSkills = getCheckedValues('skills-filter');
  const checkedValuesAvailability = getCheckedValues('availability-filter');
  let page = 0;
  const size = USER_FETCH_COUNT;

  let queryParams = getFilteredUsersURL(
    checkedValuesSkills,
    checkedValuesAvailability,
  );

  try {
    let users;
    if (queryParams.includes('&state=ONBOARDING31DAYS')) {
      queryParams = replaceOnboarding31days(queryParams);
    }

    queryParams += `&page=${page}&size=${size}`;

    queryParams += '&dev=true';

    const usersRequest = await makeApiCall(
      `${RDS_API_USERS}/search${queryParams}`,
    );
    const { users: filteredUsers } = await usersRequest.json();
    users = filteredUsers;

    manipulateQueryParamsToURL(queryParams);
    // display the filtered user list with pagination
    generateUserList(
      users,
      true,
      userListElement,

      loaderElement,
      prevBtn,
    );
  } catch (err) {
    console.debug(`User list request failed with error: ${err}`);
    showErrorMessage(
      `User list request failed with error: ${err}`,
      userListElement,

      loaderElement,
    );
  }
});

function replaceOnboarding31days(queryParams) {
  if (queryParams.includes('&state=ONBOARDING31DAYS')) {
    // Replace "&state=ONBOARDING31DAYS" with "&state=ONBOARDING&time=31d"
    queryParams = queryParams.replace(
      '&state=ONBOARDING31DAYS',
      '&state=ONBOARDING&time=31d',
    );
    return queryParams;
  }
  if (queryParams.includes('?state=ONBOARDING31DAYS')) {
    // Replace "&state=ONBOARDING31DAYS" with "&state=ONBOARDING&time=31d"
    queryParams = queryParams.replace(
      '?state=ONBOARDING31DAYS',
      '?state=ONBOARDING&time=31d',
    );
    return queryParams;
  }
}

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
  page = 0;
  showUserDataList(page, userListElement, loaderElement);
  manipulateQueryParamsToURL();
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
