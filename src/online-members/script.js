'use strict';

let members = [];
let memberTasks = [];
let isTaskDataBeingFetched = false;

function createTextNode(text) {
  return document.createTextNode(text);
}

function createProfileImage(url, alt) {
  const img = document.createElement('img');
  img.classList = PROFILE_IMAGE_CLASS;
  img.src = member.picture
    ? getCloudinaryImgURL(url, RDS_PROFILE_IMAGE_SIZE)
    : RDS_PROFILE_DEFAULT_IMAGE;
  img.setAttribute('alt', alt);
}

function createMemberNode(member) {
  const div = document.createElement('div');
  div.classList = MEMBERS_CLASS_LIST;
  div.dataset.username = member.username;
  // div.appendChild(img);
  div.appendChild(createTextNode(member.username));

  return div;
}

function createALinkNode(url, title) {
  if (!url) {
    return '';
  }
  const featureUrl = createTextNode(title);
  const a = document.createElement('a');
  a.appendChild(featureUrl);
  a.href = url;
  a.title = title;
  return a;
}

function createTaskNode(task) {
  const pTitle = document.createElement('p');
  const title = createTextNode(task.title ? `Title: ${task.title}` : '');
  pTitle.appendChild(title);
  const pPurpose = document.createElement('p');
  const purpose = createTextNode(
    task.purpose ? `Purpose: ${task.purpose}` : '',
  );
  pPurpose.appendChild(purpose);
  const a = createALinkNode(task.featureUrl, 'Feature link');
  const div = document.createElement('div');
  div.append(pTitle, pPurpose, a);
  return div;
}

function getMembersListContent(members, classList = []) {
  const fragment = new DocumentFragment();
  members.forEach((member) => {
    const li = document.createElement('li');
    li.append(createMemberNode(member));
    fragment.append(li);
  });

  const ul = document.createElement('ul');
  ul.id = MEMBERS_LIST_ID;
  ul.classList = MEMBERS_UL_CLASS_LIST;
  ul.appendChild(fragment);

  return ul;
}

function getTaskDataContent(tasks, classList = []) {
  const div = document.createElement('div');
  const h3 = document.createElement('h3');
  h3.appendChild(createTextNode('TASKS'));
  const fragment = new DocumentFragment();
  tasks.forEach((task) => {
    const div = document.createElement('div');
    div.classList = TASKS_CLASS_LIST;
    div.append(createTaskNode(task));
    fragment.append(div);
  });
  if (!fragment.hasChildNodes()) {
    const p = document.createElement('p');
    p.appendChild(
      createTextNode('No tasks found, create some for them please :P'),
    );
    fragment.appendChild(p);
  }
  div.append(h3, fragment);
  return div;
}

function showLoadingSpinner(selector) {
  const loader = document.createElement('div');
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
  showLoadingSpinner('#task-container');

  isTaskDataBeingFetched = true;

  const tasksDiv = document.getElementById(TASKS_CONTAINER_ID);
  if (tasksDiv.hasChildNodes()) {
    tasksDiv.firstElementChild.remove();
  }

  const memberTaskData = await getMemberTaskData(username);
  isTaskDataBeingFetched = false;
  hideLoadingSpinner('#task-container');
  tasksDiv.appendChild(getTaskDataContent(memberTaskData));
}

async function generateMembersList() {
  showLoadingSpinner('#members-container');
  members = await getMembersData();
  hideLoadingSpinner('#members-container');
  const membersDiv = document.getElementById(MEMBERS_CONTAINER_ID);
  const searchInputBox = generateSearchInputElement();
  membersDiv.append(searchInputBox, getMembersListContent(members));
  addEventListnerToMembersList();
}

function addEventListnerToMembersList() {
  const membersList = document.querySelector('#members-container > ul');
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
  const input = document.createElement('input');
  input.classList = MEMBERS_SEARCH_CLASS_LIST;
  input.type = 'text';
  input.id = 'searchMembers';
  input.onkeyup = searchFunction;
  input.placeholder = 'Search for memberrs';
  return input;
}

generateMembersList();
