import { getTaskLogs, getUserData, getTaskData } from './utils.js';
const container = document.getElementById('taskEvents-container');
const modal = document.getElementById('modal');
const overlay = document.querySelector('.overlay');

const closeBtn = document.getElementById('closeBtn');
closeBtn.addEventListener('click', closeModal);
const closeBtn2 = document.getElementById('closeBtn2');
closeBtn2.addEventListener('click', closeOtherModal);

function createElement({ type, attributes = {}, innerText }) {
  const element = document.createElement(type);
  Object.keys(attributes).forEach((item) => {
    element.setAttribute(item, attributes[item]);
  });
  element.textContent = innerText;
  return element;
}

function closeOtherModal() {
  document.getElementById('generic-modal').style.visibility = 'collapse';
  const containerDiv = document.getElementById('container-div');
  containerDiv.innerHTML = '';
}

function closeModal() {
  overlay.style.display = 'none';
  document.querySelector('.roles-div').remove();
  document.querySelector('.activityBtnDiv').remove();
  document.querySelector('.username').remove();
  document.querySelector('.skillTitle').remove();
  document.querySelector('.userImg').remove();
}

function addLoader(container) {
  const loader = createElement({
    type: 'div',
    attributes: { class: 'loader' },
  });
  const loaderP = createElement({
    type: 'p',
    attributes: { class: 'loaderP' },
    innerText: 'Loading...',
  });
  loader.appendChild(loaderP);
  container.appendChild(loader);
}

function removeLoader() {
  document.querySelector('.loader').remove();
}

function createEventCard(
  container,
  title,
  eventdescription,
  purpose,
  username,
  category,
  level,
) {
  const eventcard = createElement({
    type: 'details',
    attributes: { class: 'event_card' },
  });
  const summary = createElement({
    type: 'summary',
    attributes: { class: 'summary' },
  });
  const sumarryContainer = createElement({
    type: 'div',
    attributes: { class: 'sumarryContainer' },
  });

  const name = createElement({
    type: 'button',
    attributes: { class: 'name' },
    innerText: username,
  });
  name.addEventListener('click', () => createModal(username));
  const log = createElement({
    type: 'p',
    attributes: { class: 'log' },
    innerText: eventdescription,
  });
  const icon = createElement({
    type: 'img',
    attributes: {
      class: 'dropDown',
      src: './assets/down.png',
      alt: 'dropdown icon',
    },
  });
  const detailsContainer = createElement({
    type: 'div',
    attributes: { class: 'details-div-container' },
  });
  const details = createElement({
    type: 'div',
    attributes: { class: 'details-div' },
  });

  const taskTitleDiv = createElement({
    type: 'div',
    attributes: { class: 'task-title-div' },
  });
  const tasktitle = createElement({
    type: 'span',
    attributes: { class: 'task-title' },
    innerText: 'Title: ',
  });
  const titleDetail = createElement({
    type: 'span',
    attributes: { class: 'task-title-detail' },
    innerText: title,
  });

  taskTitleDiv.appendChild(tasktitle);
  taskTitleDiv.appendChild(titleDetail);

  details.appendChild(taskTitleDiv);

  const taskPurposeDiv = createElement({
    type: 'div',
    attributes: { class: 'task-purpose-div' },
  });
  const taskPurpose = createElement({
    type: 'span',
    attributes: { class: 'task-purpose' },
    innerText: 'Purpose: ',
  });
  const taskPurposeDetail = createElement({
    type: 'span',
    attributes: { class: 'task-purpose-detail' },
    innerText: purpose,
  });

  taskPurposeDiv.appendChild(taskPurpose);
  taskPurposeDiv.appendChild(taskPurposeDetail);

  details.appendChild(taskPurposeDiv);

  if (category) {
    const taskCategoryDiv = createElement({
      type: 'div',
      attributes: { class: 'task-cateogory-div' },
    });
    const taskCategory = createElement({
      type: 'span',
      attributes: { class: 'task-category' },
      innerText: 'category: ',
    });
    const taskCategoryDetail = createElement({
      type: 'span',
      attributes: { class: 'task-category-detail' },
      innerText: category,
    });

    taskCategoryDiv.appendChild(taskCategory);
    taskCategoryDiv.appendChild(taskCategoryDetail);
    details.appendChild(taskCategoryDiv);
  }

  if (level) {
    const taskLevelDiv = createElement({
      type: 'div',
      attributes: { class: 'task-level-div' },
    });
    const taskLevel = createElement({
      type: 'span',
      attributes: { class: 'task-level' },
      innerText: 'Level: ',
    });
    const taskLevelDetail = createElement({
      type: 'span',
      attributes: { class: 'task-level-detail' },
      innerText: level,
    });

    taskLevelDiv.appendChild(taskLevel);
    taskLevelDiv.appendChild(taskLevelDetail);
    details.appendChild(taskLevelDiv);
  }

  detailsContainer.appendChild(details);

  sumarryContainer.appendChild(name);
  sumarryContainer.appendChild(log);
  summary.appendChild(sumarryContainer);
  summary.appendChild(icon);

  eventcard.appendChild(summary);
  eventcard.appendChild(detailsContainer);
  container.append(eventcard);
}

async function createModal(username) {
  overlay.style.display = 'block';
  const { user } = await getUserData(username);
  // another call for roles will be made when we have userSkills collection
  const userImg = createElement({
    type: 'img',
    attributes: { src: user.picture.url, alt: 'user img', class: 'userImg' },
  });
  const userName = createElement({
    type: 'p',
    attributes: { class: 'username' },
    innerText: user.username,
  });

  document.querySelector('.top-div').prepend(userName);
  document.querySelector('.top-div').prepend(userImg);

  const skillTitle = createElement({
    type: 'p',
    attributes: { class: 'skillTitle' },
    innerText: 'Skills',
  });
  modal.appendChild(skillTitle);

  const rolesArray = [
    'React-level1',
    'Ember-level2',
    'Remix-level3',
    'NodeJs-level3',
    'random-levl1',
  ];
  const roles = createRolesDiv(rolesArray);
  modal.appendChild(roles);

  const activityBtn = createUserActivityBtn(username);
  modal.appendChild(activityBtn);
}

function createRolesDiv(roles) {
  const Allroles = [...roles];
  const rolesDiv = createElement({
    type: 'div',
    attributes: { class: 'roles-div' },
  });
  Allroles.map((role, index) => {
    const element = createElement({
      type: 'div',
      attributes: { class: 'roles-div-item' },
      innerText: role,
    });
    const removeBtn = createElement({
      type: 'button',
      attributes: { class: 'removeBtn', id: index },
      innerText: 'x',
    });
    removeBtn.addEventListener('click', removeSkill);
    element.appendChild(removeBtn);
    rolesDiv.append(element);
  });
  const addBtn = createElement({
    type: 'button',
    attributes: { class: 'addBtn' },
    innerText: '+',
  });
  addBtn.addEventListener('click', openAddRoleDiv);
  rolesDiv.appendChild(addBtn);
  return rolesDiv;
}

function createUserActivityBtn(username) {
  const activityBtnDiv = createElement({
    type: 'div',
    attributes: { class: 'activityBtnDiv' },
  });
  const activityBtn = createElement({
    type: 'button',
    attributes: { class: 'activityBtn' },
    innerText: 'show user activity',
  });
  activityBtn.addEventListener('click', () => openUserActivityModal(username));
  activityBtnDiv.appendChild(activityBtn);
  return activityBtnDiv;
}

function removeSkill(e) {
  // this is not how it's going to be done, when we have the userSkills this function is going to change
  alert(e.target.parentElement.textContent);
  e.target.parentElement.remove();
}

function openAddRoleDiv() {
  const skills = ['frontend', 'backend', 'System Design']; // this is temporary data that will be removed once we have userSkill collection in our DB
  const level = [1, 2, 3, 4, 5];
  // a submit button which will make a request to the backend and save the skill in userSkills collection
  const containerDiv = document.getElementById('container-div');
  document.getElementById('generic-modal').style.visibility = 'visible';
  const mainTitle = createElement({
    type: 'h1',
    attributes: { class: 'main-title' },
    innerText: 'Add Skills',
  });
  const skillCategoryDiv = createElement({
    type: 'div',
    attributes: { class: 'skill-category-div' },
  });
  const skillCategoryTitle = createElement({
    type: 'p',
    attributes: { class: 'skill-category-title' },
    innerText: 'Choose a skill to add',
  });
  const skillCategorySelect = createElement({
    type: 'select',
    attributes: { class: 'skill-category-select' },
  });

  for (let i = 0; i < skills.length; i++) {
    const option = createElement({
      type: 'option',
      attributes: { class: 'options' },
      innerText: skills[i],
    });
    skillCategorySelect.appendChild(option);
  }

  skillCategoryDiv.appendChild(skillCategoryTitle);
  skillCategoryDiv.appendChild(skillCategorySelect);

  const skillLevelDiv = createElement({
    type: 'div',
    attributes: { class: 'skill-level-div' },
  });
  const skillLevelTitle = createElement({
    type: 'p',
    attributes: { class: 'skill-level-title' },
    innerText: 'choose skill level',
  });
  const skillLevelSelect = createElement({
    type: 'select',
    attributes: { class: 'skill-level-select' },
  });

  for (let i = 0; i < level.length; i++) {
    const option = createElement({
      type: 'option',
      attributes: { class: 'option' },
      innerText: level[i],
    });
    skillLevelSelect.appendChild(option);
  }

  skillLevelDiv.appendChild(skillLevelTitle);
  skillLevelDiv.appendChild(skillLevelSelect);

  const submitBtn = createElement({
    type: 'button',
    attributes: { class: 'submitBtn' },
    innerText: 'Add Skill',
  });

  containerDiv.appendChild(mainTitle);
  containerDiv.appendChild(skillCategoryDiv);
  containerDiv.appendChild(skillLevelDiv);
  containerDiv.appendChild(submitBtn);
}

async function openUserActivityModal(username) {
  document.getElementById('closeBtn2').disabled = true;
  document.getElementById('generic-modal').style.visibility = 'visible';
  const containerDiv = document.getElementById('container-div');

  await renderCard(containerDiv, `${username}'s Task Logs`, username);
  document.getElementById('closeBtn2').disabled = false;
}

async function getData(data) {
  const message = data.body.message;
  const userName = data.meta.username;
  const taskId = data.meta.taskId;
  const { taskData } = await getTaskData(taskId);

  return {
    ...taskData,
    message,
    userName,
  };
}

async function renderCard(container, title, username) {
  try {
    addLoader(container);
    const mainTitle = createElement({
      type: 'h1',
      attributes: { class: 'main-title' },
      innerText: title,
    });
    const { logs } = await getTaskLogs(username);
    console.log(logs);
    const promises = logs.map((log) => getData(log));
    const allTaskData = await Promise.all(promises);
    allTaskData.map((data) =>
      createEventCard(
        container,
        data.title,
        data.message,
        data.purpose,
        data.userName,
        data.taskLevel.category,
        data.taskLevel.level,
      ),
    );
    container.prepend(mainTitle);
  } catch (error) {
    console.log(error);
    alert('error happened');
  } finally {
    removeLoader();
  }
}

renderCard(container, 'All Task Logs');
