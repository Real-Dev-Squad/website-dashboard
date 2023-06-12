// GLOBAL UTILS  ====================================================================================================
async function getSelfUser() {
  try {
    const res = await fetch(`${API_BASE_URL}/users/self`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });
    const self_user = await res.json();
    if (res.status === 200) {
      return self_user;
    }
  } catch (err) {
    console.error(MESSAGE_SOMETHING_WENT_WRONG, err);
    throw err;
  }
}

async function checkUserIsSuperUser() {
  const self_user = await getSelfUser();
  return self_user?.roles['super_user'];
}

function createElement({ type, attributes = {}, innerText }) {
  const element = document.createElement(type);
  Object.keys(attributes).forEach((item) => {
    element.setAttribute(item, attributes[item]);
  });
  element.textContent = innerText;
  return element;
}

function addLoader(container) {
  if (!container) return;
  const loader = createElement({
    type: 'div',
    attributes: { class: 'loader' },
  });
  const loadertext = createElement({
    type: 'p',
    attributes: { class: 'loader-text' },
    innerText: 'Loading...',
  });
  loader.appendChild(loadertext);
  container.appendChild(loader);
}

function removeLoader(classname) {
  document.querySelector(`.${classname}`).remove();
}

// API CALL UTILS  ====================================================================================================
async function makeApiCall(
  url,
  method = 'get',
  body = null,
  headers = [],
  options = null,
) {
  try {
    const response = await fetch(url, {
      method,
      body,
      headers,
      ...options,
    });
    return response;
  } catch (err) {
    console.error(MESSAGE_SOMETHING_WENT_WRONG, err);
    throw err;
  }
}

// USERS UTILS  ====================================================================================================
async function makeApiCallForUsers(
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
    console.error(err);
    throw err;
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

// USERS/DETAILS UTILS  ====================================================================================================
function generateNoDataFoundSection(message) {
  document.title = 'User Not Found';
  const notFoundDiv = createElement({ type: 'div', classList: ['not-found'] });
  const notFoundImg = createElement({
    type: 'img',
    classList: ['not-found-img'],
  });
  notFoundImg.src = '/images/page-not-found.png';
  notFoundImg.setAttribute('alt', 'page not found');
  const notFoundText = createElement({
    type: 'h1',
    classList: ['not-found-text-h1'],
  });
  notFoundText.appendChild(createTextNode(message));
  notFoundDiv.append(notFoundImg, notFoundText);
  const container = document.querySelector('.user-details-header');
  container.appendChild(notFoundDiv);
}

// PROFILE UTILS  ====================================================================================================
async function getProfileDiffs() {
  try {
    const profileDiffsResponse = await fetch(`${API_BASE_URL}/profileDiffs`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    const { profileDiffs } = await profileDiffsResponse.json();
    return { profileDiffs };
  } catch (error) {
    alert(`Error: ${error}`);
  }
}

function formatPropertyField(property) {
  return property
    .split('_')
    .map((x) => x[0].toUpperCase() + x.slice(1))
    .join(' ');
}

function getDataItem(data, itemName) {
  const item = data[itemName];

  if (item) {
    return item;
  } else {
    if (itemName === YEARS_OF_EXPERIENCE && item === 0) return item;
    else return '';
  }
}

function checkDifferentValues(primaryData, secondaryData) {
  const diffValues = new Set();

  for (const listItem in primaryData) {
    const oldValue = getDataItem(primaryData, listItem);
    const newValue = getDataItem(secondaryData, listItem);
    const isValueEqual = String(oldValue).trim() === String(newValue).trim();

    if (!isValueEqual) {
      diffValues.add(listItem);
    }
  }

  return diffValues;
}

function displayList(profileData, userInfoList, diffValues, listType) {
  for (const listItem in profileData) {
    let diffClass;
    if (diffValues.has(listItem)) {
      diffClass = listType === OLD_DATA ? OLD_DIFF_CLASS : NEW_DIFF_CLASS;
    }

    const fragment = new DocumentFragment();

    const spanKey = createCardComponent({
      tagName: 'span',
      innerText: `${formatPropertyField(listItem)}: `,
      parent: fragment,
    });

    const spanValue = createCardComponent({
      tagName: 'span',
      innerText: `${getDataItem(profileData, listItem)}`,
      classNames: diffClass ? [DIFF_CLASS, diffClass] : '',
      parent: fragment,
    });

    const li = createCardComponent({
      tagName: 'li',
      parent: userInfoList,
      child: fragment,
    });
  }
}

function createCard({ oldData, newData, userId, username, profileDiffId }) {
  const wrapper = createCardComponent({
    tagName: 'div',
    className: 'wrapperDiv',
  });

  const footerDiv = document.querySelector('#footer');
  document.body.insertBefore(wrapper, footerDiv);

  const cardContainer = createCardComponent({
    className: 'cardDiv',
    tagName: 'div',
    parent: wrapper,
  });

  const userName = createCardComponent({
    tagName: 'p',
    innerText: `Username: ${username}`,
    className: 'userNameContainer',
    parent: cardContainer,
  });

  const dataContainer = createCardComponent({
    tagName: 'div',
    className: 'dataContainer',
    parent: cardContainer,
  });

  const dataInnerContainer = createCardComponent({
    tagName: 'div',
    className: 'dataInnerContainer',
    parent: dataContainer,
  });

  const oldDataContainer = createCardComponent({
    tagName: 'div',
    className: 'oldDataContainer',
    parent: dataInnerContainer,
  });

  const oldDataHeading = createCardComponent({
    tagName: 'h3',
    innerText: 'Old Data',
    parent: oldDataContainer,
  });

  const diffValues = checkDifferentValues(oldData, newData);

  const oldUserInfoList = createCardComponent({
    tagName: 'ul',
    className: 'userInfoListContainer',
    parent: oldDataContainer,
  });

  displayList(oldData, oldUserInfoList, diffValues, OLD_DATA);

  const newDataContainer = createCardComponent({
    tagName: 'div',
    className: 'newDataContainer',
    parent: dataInnerContainer,
  });

  const newDataHeading = createCardComponent({
    tagName: 'h3',
    innerText: 'New Data',
    parent: newDataContainer,
  });

  const newUserInfoList = createCardComponent({
    tagName: 'ul',
    className: 'userInfoListContainer',
    parent: newDataContainer,
  });

  displayList(newData, newUserInfoList, diffValues, NEW_DATA);

  const buttonsContainer = createCardComponent({
    tagName: 'div',
    className: 'buttonsContainer',
    parent: dataContainer,
  });

  const approveBtn = createCardComponent({
    tagName: 'button',
    innerText: APPROVE_BUTTON_TEXT,
    parent: buttonsContainer,
  });
  const rejectBtn = createCardComponent({
    tagName: 'button',
    innerText: REJECT_BUTTON_TEXT,
    parent: buttonsContainer,
  });

  approveBtn.onclick = async () => {
    const reason = prompt(APPROVAL_PROMPT_TEXT);
    if (reason != null) {
      document.getElementById('cover-spin').style.display = 'block';
      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            id: profileDiffId,
            message: reason,
          }),
        });

        if (response.ok) {
          alert(ALERT_APPROVED);
          window.location.reload();
        } else {
          alert(ALERT_ERROR);
        }
      } catch (error) {
        alert(ALERT_ERROR);
      } finally {
        document.getElementById('cover-spin').style.display = 'none';
      }
    }
  };

  rejectBtn.onclick = async () => {
    const reason = prompt('Reason for Rejection');
    if (reason != null) {
      document.getElementById('cover-spin').style.display = 'block';
      try {
        const response = await fetch(`${API_BASE_URL}/users/rejectDiff`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            profileDiffId,
            message: reason,
          }),
        });

        if (response.ok) {
          alert(ALERT_REJECTED);
          window.location.reload();
        } else {
          alert(ALERT_ERROR);
        }
      } catch (error) {
        alert(ALERT_ERROR);
      } finally {
        document.getElementById('cover-spin').style.display = 'none';
      }
    }
  };

  document.getElementById('loader').style.display = 'none';
}

function createCardComponent({
  className,
  classNames,
  tagName,
  innerText,
  parent,
  child,
}) {
  const component = document.createElement(tagName);
  if (className) {
    component.classList.add(className);
  }

  if (classNames) {
    classNames.forEach((c) => component.classList.add(c));
  }

  if (innerText) {
    component.innerText = innerText;
  }

  if (parent) {
    parent.appendChild(component);
  }

  if (child) {
    component.appendChild(child);
  }

  return component;
}

function wantedData(data) {
  const {
    id,
    first_name,
    last_name,
    email,
    phone,
    yoe,
    company,
    designation,
    github_id,
    linkedin_id,
    twitter_id,
    instagram_id,
    website,
  } = data;
  return {
    id,
    first_name,
    last_name,
    email,
    phone,
    yoe,
    company,
    designation,
    github_id,
    linkedin_id,
    twitter_id,
    instagram_id,
    website,
  };
}

async function getUser(userId) {
  const userResponse = await fetch(`${API_BASE_URL}/users?id=${userId}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const { user } = await userResponse.json();
  return user;
}

// USERS/DISCORD UTILS  ====================================================================================================
const getUsers = async (tab) => {
  let URL = {
    in_discord: `${API_BASE_URL}/users/search/?role=in_discord`,
    verified: `${API_BASE_URL}/users/search/?verified=true`,
  };

  try {
    const response = await fetch(URL[tab], {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    const data = await response.json();
    return data.users ?? [];
  } catch (err) {
    console.error(err);
  }
};

// ONLINE-MEMBERS UTILS  ====================================================================================================
async function getMembersData() {
  let membersList = null;
  const memberObject = {};
  const membersRequest = await makeApiCall(RDS_API_MEMBERS);
  if (membersRequest.status === 200) {
    membersList = await membersRequest.json();
    membersList = membersList.members;
    membersList = membersList.filter((member) => !member.incompleteUserDetails);
    membersList.forEach((member) => {
      memberObject[`${member.username}`] = {
        isOnline: false,
        ...member,
      };
    });
  }
  return memberObject;
}

async function getMemberTaskData(username) {
  let taskData = null;
  const membersRequest = await makeApiCall(rdsApiTaskDetails(username));
  if (membersRequest.status === 200) {
    taskData = await membersRequest.json();
    taskData = taskData.tasks;
  }
  return taskData;
}

const rdsApiTaskDetails = (username = null) =>
  `${RDS_API_TASKS_USERS}/${username}`;

const getCloudinaryImgURL = (publicId, configs) => {
  const imageSizeOptions = configs ? `/${configs}` : '';
  return `${RDS_CLOUDINARY_CLOUD_URL}${imageSizeOptions}/${publicId}`;
};

function getMemberProfileImageLink(publicId) {
  return publicId
    ? getCloudinaryImgURL(publicId, RDS_PROFILE_IMAGE_SIZE)
    : RDS_PROFILE_DEFAULT_IMAGE;
}

function searchFunction() {
  let divText, txtValue;
  const input = document.getElementById('search-members');
  const filter = input.value.toUpperCase();
  const ul = document.getElementById(MEMBERS_LIST_ID);
  const li = ul.getElementsByTagName('li');
  const liArray = Array.from(li);
  liArray.forEach((liItem) => {
    divText = liItem.getElementsByTagName('div')[0];
    txtValue = divText.textContent || divText.innerText;
    const displayStyle =
      txtValue.toUpperCase().indexOf(filter) > -1 ? '' : 'none';
    liItem.style.display = displayStyle;
  });
}

// TASKEVENTS ====================================================================================================
function addLoader(container) {
  const loader = createElement({
    type: 'div',
    attributes: { class: 'loader' },
  });
  const loadertext = createElement({
    type: 'p',
    attributes: { class: 'loader-text' },
    innerText: 'Loading...',
  });
  loader.appendChild(loadertext);
  container.appendChild(loader);
}

function removeLoader() {
  document.querySelector('.loader').remove();
}

function addErrorMessage(container) {
  const errorDiv = createElement({
    type: 'div',
    attributes: { class: 'error-div' },
  });
  const errorMsg = createElement({
    type: 'p',
    attributes: { class: 'error-message' },
    innerText: 'Something went wrong!',
  });
  errorDiv.appendChild(errorMsg);
  container.appendChild(errorDiv);
}

async function getTaskLogs(username) {
  const url = username
    ? `${API_BASE_URL}/logs/task?meta.username=${username}`
    : `${API_BASE_URL}/logs/task`;
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });

  const task_logs = await res.json();
  return task_logs;
}

async function getTaskData(id) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}/details`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const task_details = await res.json();
  return task_details;
}

async function getUserData(username) {
  const res = await fetch(`${API_BASE_URL}/users/${username}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const userData = await res.json();
  return userData;
}

async function getSelfDetails() {
  const res = await fetch(`${API_BASE_URL}/users/self`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });

  const self_details = await res.json();
  return self_details;
}

async function getData(data) {
  const newData = data?.body.new;
  const userName = data?.meta.username;
  const taskId = data?.meta.taskId;
  const { taskData } = await getTaskData(taskId);

  return {
    ...taskData,
    newData,
    userName,
  };
}

async function getUserSkills(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/skills`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });
    if (response.status === 500) {
      alert('server error');
      console.log(response);
      return;
    }
    const userSkills = await response.json();
    return userSkills;
  } catch (error) {
    alert('something went wrong');
    console.log(error);
  }
}

async function getTagLevelOptions() {
  try {
    const levelsResponse = await fetch(`${API_BASE_URL}/levels`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });
    const tagsResponse = await fetch(`${API_BASE_URL}/tags`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    if (tagsResponse.status === 500 || levelsResponse.status === 500) {
      alert('server error');
      console.log(response);
      return;
    }
    const { tags } = await tagsResponse.json();
    let { levels } = await levelsResponse.json();
    levels = levels.sort((a, b) => {
      if (a.value < b.value) return -1;
      if (a.value > b.value) return 1;
      return 0;
    });
    return { levels, tags };
  } catch (error) {
    alert(`something went wrong`);
    console.error(error);
  }
}

async function addSkillToUser(tagToAdd, levelToAdd, userId) {
  const body = {
    itemId: userId,
    itemType: 'USER',
    tagPayload: [
      {
        levelId: levelToAdd?.id,
        tagId: tagToAdd?.id,
      },
    ],
  };
  try {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
      },
    });
    if (response.status === 500) {
      alert('server error');
      console.log(response);
      return;
    }
    return response;
  } catch (error) {
    alert('something went wrong');
    console.error(error);
  }
}

async function removeSkillFromUser(tagId, userId) {
  const body = {
    itemId: userId,
    tagId,
  };
  try {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (response.status === 500) {
      alert('server error');
      console.log(response);
      return;
    }
    return response;
  } catch (error) {
    alert('something went wrong');
    console.error(error);
  }
}

// EXTENSION-REQUESTS ====================================================================================================
async function getExtensionRequests(query = {}) {
  const url = new URL(`${API_BASE_URL}/extension-requests`);

  queryParams = ['assignee', 'status', 'taskId'];
  queryParams.forEach(
    (key) => query[key] && url.searchParams.set(key, query[key]),
  );

  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  return await res.json();
}

async function updateExtensionRequest({ id, body }) {
  const url = `${API_BASE_URL}/extension-requests/${id}`;
  const res = await fetch(url, {
    credentials: 'include',
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-type': 'application/json',
    },
  });
  return await res.json();
}

async function updateExtensionRequestStatus({ id, body }) {
  const url = `${API_BASE_URL}/extension-requests/${id}/status`;
  const res = await fetch(url, {
    credentials: 'include',
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-type': 'application/json',
    },
  });
  return await res.json();
}

async function getTaskDetails(taskId) {
  if (!taskId) return;
  const url = `${API_BASE_URL}/tasks/${taskId}/details`;
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  return await res.json();
}

function getTimeFromTimestamp(timestamp) {
  return new Date(timestamp * 1000).toLocaleString();
}

function createTable(headings, data, className = '') {
  const table = createElement({
    type: 'table',
    attributes: {
      class: className,
    },
  });
  const tableBody = createElement({ type: 'tbody' });
  headings.forEach(({ title, key, time, bold }) => {
    let row = createElement({ type: 'tr' });
    let rowHeading = createElement({ type: 'th', innerText: title });

    let contentText = '';
    if (time) contentText = getTimeFromTimestamp(data[key]);
    else contentText = key ? data[key] : data[title.toLowerCase()];

    let tableData = createElement({
      type: 'td',
      innerText: contentText,
      attributes: {
        class: bold ? 'bold' : '',
      },
    });
    row.appendChild(rowHeading);
    row.appendChild(tableData);
    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  return table;
}

function formDataToObject(formData) {
  if (!formData) return;
  const result = {};
  for (const [key, value] of formData.entries()) {
    result[key] = value;
  }
  return result;
}

// DISCORD-GROUPS UTILS  ====================================================================================================
const BASE_URL = 'https://api.realdevsquad.com'; // REPLACE WITH YOUR LOCALHOST URL FOR TESTING LOCAL BACKEND
async function getMembers() {
  try {
    const res = await fetch(`${BASE_URL}/users/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    const { users } = await res.json();
    return users;
  } catch (err) {
    return err;
  }
}
async function getUserSelf() {
  try {
    const res = await fetch(`${BASE_URL}/users/self`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    const user_self = await res.json();
    return user_self;
  } catch (err) {
    return err;
  }
}
async function getDiscordGroups() {
  try {
    const res = await fetch(`${BASE_URL}/discord-actions/groups`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    const { groups } = await res.json();
    return groups;
  } catch (err) {
    return err;
  }
}
async function createDiscordGroupRole(groupRoleBody) {
  try {
    const res = await fetch(`${BASE_URL}/discord-actions/groups`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(groupRoleBody),
    });

    const self_user = await res.json();
    return self_user;
  } catch (err) {
    return err;
  }
}

async function addGroupRoleToMember(memberRoleBody) {
  try {
    const res = await fetch(`${BASE_URL}/discord-actions/roles`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(memberRoleBody),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return err;
  }
}
