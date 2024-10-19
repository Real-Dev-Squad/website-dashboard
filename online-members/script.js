'use strict';

let members = {};
let memberTasks = [];
let isTaskDataBeingFetched = false;

function createElement({ type, classList = [] }) {
  const element = document.createElement(type);
  element.classList.add(...classList);
  return element;
}

function createTextNode(text) {
  return document.createTextNode(text);
}

function createProfileImage(publicId = '', alt = '') {
  const img = createElement({
    type: 'img',
    classList: PROFILE_IMAGE_CLASS_LIST,
  });
  img.src = getUserProfileImageLink(publicId);
  img.setAttribute('alt', alt);
  return img;
}

function createUserNode(user) {
  const userDiv = createElement({
    type: 'div',
    classList: USERS_CLASS_LIST,
  });
  userDiv.dataset.username = user.username;

  const userOnlineDiv = createElement({
    type: 'div',
    classList: USERS_ONLINE_CLASS_LIST,
  });

  const userImage = createProfileImage(user?.picture?.publicId);
  const usernameText = createTextNode(user.username);

  const profileAndNameDiv = createElement({
    type: 'div',
    classList: PROFILE_NAME_CLASS_LIST,
  });
  profileAndNameDiv.append(userImage, usernameText);

  userDiv.append(profileAndNameDiv, userOnlineDiv);

  return userDiv;
}

function createAnchorLinkNode(url, title) {
  if (!url) {
    return '';
  }
  const featureUrl = createTextNode(title);
  const a = createElement({ type: 'a' });
  a.appendChild(featureUrl);
  a.href = url;
  a.title = title;
  return a;
}

function createTaskNode(task) {
  const pTitle = createElement({ type: 'p' });
  const title = createTextNode(task.title ? `Title: ${task.title}` : '');
  pTitle.appendChild(title);
  const pPurpose = createElement({ type: 'p' });

  const purpose = createTextNode(
    task.purpose ? `Purpose: ${task.purpose}` : '',
  );
  pPurpose.appendChild(purpose);

  const a = createAnchorLinkNode(task.featureUrl, 'Feature link');

  const div = createElement({ type: 'div' });
  div.append(pTitle, pPurpose, a);

  return div;
}

function getUsersListContent(users, classList = []) {
  const fragment = new DocumentFragment();

  const usersList = Object.keys(users);

  usersList.forEach((user) => {
    const li = createElement({ type: 'li' });
    li.append(createUserNode(users[user]));
    fragment.append(li);
  });

  const ul = createElement({ type: 'ul', classList: USERS_UL_CLASS_LIST });
  ul.id = USERS_LIST_ID;
  ul.appendChild(fragment);

  return ul;
}

function getTaskDataContent({ tasks, username, classList = [] }) {
  const div = createElement({
    type: 'div',
    classList: TASKS_SUBCONTAINER_CLASS_LIST,
  });
  const h3 = createElement({
    type: 'h3',
    classList: TASKS_CONTAINER_TITLE_CLASS_LIST,
  });
  h3.appendChild(createTextNode(`TASKS - ${username}`));
  const fragment = new DocumentFragment();
  tasks.forEach((task) => {
    const div = createElement({ type: 'div', classList: TASKS_CLASS_LIST });
    div.append(createTaskNode(task));
    fragment.append(div);
  });
  if (!fragment.hasChildNodes()) {
    const p = createElement({ type: 'p' });
    p.appendChild(createTextNode(MESSAGE_NO_TASK));
    fragment.appendChild(p);
  }
  div.append(h3, fragment);
  return div;
}

function showLoadingSpinner(selector) {
  const loader = createElement({ type: 'div' });
  loader.appendChild(createTextNode(MESSAGE_LOADING));
  document.querySelector(selector).appendChild(loader);
}

function hideLoadingSpinner(selector) {
  const div = document.querySelector(selector);
  if (div.hasChildNodes()) {
    div.firstElementChild.remove();
  }
}

async function generateUserTaskData(username) {
  if (isTaskDataBeingFetched) {
    return;
  }

  showLoadingSpinner(`#${TASKS_CONTAINER_ID}`);

  isTaskDataBeingFetched = true;

  const tasksDiv = document.getElementById(TASKS_CONTAINER_ID);
  if (tasksDiv.hasChildNodes()) {
    tasksDiv.firstElementChild.remove();
  }

  const userTaskData = await getUserTaskData(username);
  isTaskDataBeingFetched = false;
  hideLoadingSpinner(`#${TASKS_CONTAINER_ID}`);
  tasksDiv.appendChild(getTaskDataContent({ tasks: userTaskData, username }));
}

async function generateUsersList() {
  showLoadingSpinner(`#${USERS_CONTAINER_ID}`);
  let users = await getUsersData();
  hideLoadingSpinner(`#${USERS_CONTAINER_ID}`);
  const usersDiv = document.getElementById(USERS_CONTAINER_ID);
  const searchInputBox = generateSearchInputElement();
  usersDiv.append(searchInputBox, getUsersListContent(users));
  addEventListenerToUsersList();
}

function addEventListenerToUsersList() {
  const usersList = document.querySelector(`#${USERS_CONTAINER_ID} > UL`);
  usersList.addEventListener('click', (event) => {
    const userElement = event.target.closest(`.${USERS_CLASS}`);
    document.getElementById(TASKS_CONTAINER_ID).style.display = 'block';
    if (!userElement) {
      return;
    }
    const username = userElement.dataset.username;
    if (!username) {
      throw new Error('Some error occurred, please try again or contact admin');
    }
    generateUserTaskData(username);
  });
}

function generateSearchInputElement() {
  const searchInputField = createElement({
    type: 'input',
    classList: USERS_SEARCH_INPUT_CLASS_LIST,
  });
  searchInputField.type = 'text';
  searchInputField.id = USERS_SEARCH_ID;
  searchInputField.onkeyup = searchFunction;
  searchInputField.placeholder = USERS_SEARCH_PLACEHOLDER;

  const div = createElement({
    type: 'div',
    classList: USERS_SEARCH_CLASS_LIST,
  });
  div.appendChild(searchInputField);
  return div;
}

generateUsersList();
