import {
  getTaskLogs,
  getUserData,
  getSelfDetails,
  createElement,
  getData,
  addLoader,
  addErrorMessage,
  removeLoader,
  getUserSkills,
  getTagLevelOptions,
  addSkillToUser,
} from './utils.js';

import roleElement from './roleElement.js';

import { createEventCard } from './logCard.js';

let tagLevelOptions;
const container = document.getElementById('task-events-container');
const modal = document.getElementById('modal');
const overlay = document.querySelector('.overlay');
export const modalOverlay = createElement({
  type: 'div',
  attributes: {
    class: 'modal-overlay',
  },
});
const modalOverlayLoader = createElement({
  type: 'div',
  attributes: {
    class: 'dot-flashing-loader',
  },
});
modal.appendChild(modalOverlay);
modalOverlay.appendChild(modalOverlayLoader);

const closeBtn = document.getElementById('close-btn');
closeBtn.addEventListener('click', closeModal);
const genericModalCloseBtn = document.getElementById('close-generic-modal');
genericModalCloseBtn.addEventListener('click', closeGenericModal);

addEventListener('load', async (event) => {
  tagLevelOptions = await getTagLevelOptions();
});

async function createProfileModal(username) {
  try {
    overlay.classList.remove('hidden');
    const { user } = await getUserData(username);
    const { skills } = await getUserSkills(user.id);
    const rolesDiv = createRolesDiv(skills, user.id);
    // another call for roles will be made when we have userSkills collection
    const userImg = createElement({
      type: 'img',
      attributes: {
        src: user.picture.url || './assets/Avatar.png',
        alt: 'user img',
        class: 'user-img',
      },
    });
    const userName = createElement({
      type: 'p',
      attributes: { class: 'username' },
      innerText: user.username,
    });

    document.querySelector('.top-div').prepend(userName);
    document.querySelector('.top-div').prepend(userImg);

    const skillTitle = createElement({
      type: 'div',
      attributes: { class: 'skill-title-container' },
    });
    const title = createElement({
      type: 'span',
      attributes: { class: 'skill-title' },
      innerText: 'Skills',
    });
    const addBtn = createElement({
      type: 'button',
      attributes: { class: 'add-btn' },
      innerText: '+',
    });
    addBtn.addEventListener('click', () =>
      openAddSkillModal(user.id, rolesDiv),
    );
    skillTitle.appendChild(title);
    skillTitle.appendChild(addBtn);
    modal.appendChild(skillTitle);
    modal.appendChild(rolesDiv);

    const activityBtn = createUserActivityBtn(username);
    modal.appendChild(activityBtn);
  } catch (err) {
    addErrorMessage(modal);
    console.log(err);
  }
}

function createRolesDiv(roles, userid) {
  const Allroles = [...roles];
  const rolesDiv = createElement({
    type: 'div',
    attributes: { class: 'roles-div' },
  });
  Allroles.map((role) => {
    rolesDiv.append(
      roleElement(role.tagname, role.levelname, role.tagid, userid),
    );
  });
  return rolesDiv;
}

function createUserActivityBtn(username) {
  const activityBtnDiv = createElement({
    type: 'div',
    attributes: { class: 'activity-btn-div' },
  });
  const activityBtn = createElement({
    type: 'button',
    attributes: { class: 'activity-btn' },
    innerText: 'show user activity',
  });
  activityBtn.addEventListener('click', () => openUserActivityModal(username));
  activityBtnDiv.appendChild(activityBtn);
  return activityBtnDiv;
}

function closeModal() {
  overlay.classList.add('hidden');
  const errorDiv = document.querySelector('.error-div');
  if (errorDiv) {
    errorDiv.remove();
    return;
  }
  document.querySelector('.roles-div').remove();
  document.querySelector('.activity-btn-div').remove();
  document.querySelector('.username').remove();
  document.querySelector('.skill-title').remove();
  document.querySelector('.user-img').remove();
}

function closeGenericModal() {
  document.getElementById('generic-modal').style.visibility = 'collapse';
  const containerDiv = document.getElementById('container-div');
  containerDiv.innerHTML = '';
}

function openAddSkillModal(userid, rolesDiv) {
  const skills = tagLevelOptions.allTags;
  const level = tagLevelOptions.allLevels;
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
  const skillCategoryLabel = createElement({
    type: 'p',
    attributes: { class: 'skill-category-label' },
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
      innerText: skills[i].name,
    });
    skillCategorySelect.appendChild(option);
  }

  skillCategoryDiv.appendChild(skillCategoryLabel);
  skillCategoryDiv.appendChild(skillCategorySelect);

  const skillLevelDiv = createElement({
    type: 'div',
    attributes: { class: 'skill-level-div' },
  });
  const skillLevelLabel = createElement({
    type: 'p',
    attributes: { class: 'skill-level-label' },
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
      innerText: level[i].name,
    });
    skillLevelSelect.appendChild(option);
  }

  skillLevelDiv.appendChild(skillLevelLabel);
  skillLevelDiv.appendChild(skillLevelSelect);

  const submitBtn = createElement({
    type: 'button',
    attributes: { class: 'skill-submit-btn' },
    innerText: 'Add Skill',
  });

  // once we have the tags collection we can make an API call here to add that skill tag to user, when the super user clicks on submit

  containerDiv.appendChild(mainTitle);
  containerDiv.appendChild(skillCategoryDiv);
  containerDiv.appendChild(skillLevelDiv);
  containerDiv.appendChild(submitBtn);

  submitBtn.addEventListener('click', async () => {
    const skillToAdd = skills?.find(
      (skill) => skill.name === skillCategorySelect.value,
    );
    const levelToAdd = level?.find(
      (lvl) => lvl.name === skillLevelSelect.value,
    );
    const loaderElement = createElement({
      type: 'div',
      attributes: { class: 'dot-flashing-loader' },
    });
    submitBtn.innerText = '';
    submitBtn.append(loaderElement);
    submitBtn.classList.add('disabled');
    const response = await addSkillToUser(skillToAdd, levelToAdd, userid);
    loaderElement.remove();
    submitBtn.innerText = `Add Skill`;
    submitBtn.classList.remove('disabled');
    if (response.ok) {
      rolesDiv.append(
        roleElement(skillToAdd.name, levelToAdd.name, skillToAdd.id, userid),
      );
    }
  });
}

async function openUserActivityModal(username) {
  document.getElementById('close-generic-modal').disabled = true;
  document.getElementById('generic-modal').style.visibility = 'visible';
  const containerDiv = document.getElementById('container-div');

  await renderCard({
    container: containerDiv,
    title: `${username}'s Task Logs`,
    username,
  });
  document.getElementById('close-generic-modal').disabled = false;
}

async function renderCard({ container, title, username, isAllTasks }) {
  try {
    addLoader(container);
    const mainTitle = createElement({
      type: 'h1',
      attributes: { class: 'main-title' },
      innerText: title,
    });
    const { logs } = await getTaskLogs(username);

    if (logs.length === 0) {
      const noLogsFound = createElement({
        type: 'p',
        attributes: { class: 'no-logs-found' },
        innerText: 'No Task Logs Found!',
      });
      container.appendChild(noLogsFound);
      return;
    }
    const promises = logs.map((log) => getData(log));
    const allTaskData = await Promise.all(promises);

    for (const data of allTaskData) {
      createEventCard({
        container,
        title: data.title,
        logArray: data.messages,
        purpose: data.purpose,
        username: data.userName,
        category: data.category ?? '-',
        level: data.level ?? '-',
        isAllTasks,
        createModal: createProfileModal,
      });
    }
    container.prepend(mainTitle);
  } catch (error) {
    // in case our API call fails we need to enable that button
    document.getElementById('close-generic-modal').disabled = false;
    addErrorMessage(container);
  } finally {
    removeLoader();
  }
}

async function render() {
  try {
    addLoader(container);
    const selfDetails = await getSelfDetails();
    if (selfDetails.roles.super_user) {
      renderCard({ container, title: 'All Task Logs', isAllTasks: true });
    } else {
      const elementContainer = createElement({
        type: 'div',
        attributes: { class: 'unauthorized-div' },
      });
      const element = createElement({
        type: 'p',
        attributes: { class: 'unauthorized' },
        innerText: 'You are not authorized to view this page',
      });
      elementContainer.appendChild(element);
      container.appendChild(elementContainer);
    }
  } catch (err) {
    addErrorMessage(container);
  } finally {
    removeLoader();
  }
}

render();
