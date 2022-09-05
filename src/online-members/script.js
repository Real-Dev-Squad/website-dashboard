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

function createProfileImage(src = '', alt = '') {
  const img = createElement({
    type: 'img',
    classList: PROFILE_IMAGE_CLASS_LIST,
  });
  img.src = src
    ? getCloudinaryImgURL(src, RDS_PROFILE_IMAGE_SIZE)
    : RDS_PROFILE_DEFAULT_IMAGE;
  img.setAttribute('alt', alt);
  return img;
}

function createMemberNode(member) {
  const memberDiv = createElement({
    type: 'div',
    classList: MEMBERS_CLASS_LIST,
  });
  memberDiv.dataset.username = member.username;

  const memberOnlineDiv = createElement({
    type: 'div',
    classList: MEMBERS_ONLINE_CLASS_LIST,
  });

  const memberImage = createProfileImage(member?.picture?.publicId);
  const usernameText = createTextNode(member.username);

  const profileAndNameDiv = createElement({
    type: 'div',
    classList: PROFILE_NAME_CLASS_LIST,
  });
  profileAndNameDiv.append(memberImage, usernameText);

  memberDiv.append(profileAndNameDiv, memberOnlineDiv);

  return memberDiv;
}

function createALinkNode(url, title) {
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

  const a = createALinkNode(task.featureUrl, 'Feature link');

  const div = createElement({ type: 'div' });
  div.append(pTitle, pPurpose, a);

  return div;
}

function getMembersListContent(members, classList = []) {
  const fragment = new DocumentFragment();

  const membersList = Object.keys(members);

  membersList.forEach((member) => {
    const li = createElement({ type: 'li' });
    li.append(createMemberNode(members[member]));
    fragment.append(li);
  });

  const ul = createElement({ type: 'ul', classList: MEMBERS_UL_CLASS_LIST });
  ul.id = MEMBERS_LIST_ID;
  ul.appendChild(fragment);

  return ul;
}

function getTaskDataContent(tasks, classList = []) {
  const div = createElement({ type: 'div' });
  const h3 = createElement({ type: 'h3' });
  h3.appendChild(createTextNode('TASKS'));
  const fragment = new DocumentFragment();
  tasks.forEach((task) => {
    const div = createElement({ type: 'div', classList: TASKS_CLASS_LIST });
    div.append(createTaskNode(task));
    fragment.append(div);
  });
  if (!fragment.hasChildNodes()) {
    const p = createElement({ type: 'p' });
    p.appendChild(
      createTextNode('No tasks found, create some for them please :P'),
    );
    fragment.appendChild(p);
  }
  div.append(h3, fragment);
  return div;
}

function showLoadingSpinner(selector) {
  const loader = createElement({ type: 'div' });
  loader.appendChild(createTextNode('LOADING...'));
  document.querySelector(selector).appendChild(loader);
}

function hideLoadingSpinner(selector) {
  const div = document.querySelector(selector);
  if (div.hasChildNodes()) {
    div.firstElementChild.remove();
  }
}

async function generateMemberTaskData(username) {
  if (isTaskDataBeingFetched) {
    return;
  }

  showLoadingSpinner(`#${TASKS_CONTAINER_ID}`);

  isTaskDataBeingFetched = true;

  const tasksDiv = document.getElementById(TASKS_CONTAINER_ID);
  if (tasksDiv.hasChildNodes()) {
    tasksDiv.firstElementChild.remove();
  }

  const memberTaskData = await getMemberTaskData(username);
  isTaskDataBeingFetched = false;
  hideLoadingSpinner(`#${TASKS_CONTAINER_ID}`);
  tasksDiv.appendChild(getTaskDataContent(memberTaskData));
}

async function generateMembersList() {
  showLoadingSpinner(`#${MEMBERS_CONTAINER_ID}`);
  members = await getMembersData();
  hideLoadingSpinner(`#${MEMBERS_CONTAINER_ID}`);
  const membersDiv = document.getElementById(MEMBERS_CONTAINER_ID);
  const searchInputBox = generateSearchInputElement();
  membersDiv.append(searchInputBox, getMembersListContent(members));
  addEventListenerToMembersList();
}

function addEventListenerToMembersList() {
  const membersList = document.querySelector(`#${MEMBERS_CONTAINER_ID} > ul`);
  membersList.addEventListener('click', (event) => {
    const membersDiv = event.target.nodeName === 'DIV';
    if (!membersDiv) {
      return;
    }
    const username = event.target.dataset.username;
    generateMemberTaskData(username);
  });
}

function generateSearchInputElement() {
  const searchInputField = createElement({
    type: 'input',
    classList: MEMBERS_SEARCH_INPUT_CLASS_LIST,
  });
  searchInputField.type = 'text';
  searchInputField.id = 'searchMembers';
  searchInputField.onkeyup = searchFunction;
  searchInputField.placeholder = 'Search for memberrs';

  const div = createElement({
    type: 'div',
    classList: MEMBERS_SEARCH_CLASS_LIST,
  });
  div.appendChild(searchInputField);
  return div;
}

generateMembersList();
