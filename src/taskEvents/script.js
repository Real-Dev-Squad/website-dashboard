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

import skillElement from './skillElement.js';

import { createEventCard } from './logCard.js';

let tagLevelOptions;
let userProfileElements; // list<Array> of user profile elements that are appended to modal
const container = document.getElementById('task-events-container');
const modal = document.getElementById('modal');
const overlay = document.querySelector('.overlay');
const modalOverlay = createElement({
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
closeBtn.addEventListener('click', () => closeModal(userProfileElements));
const genericModalCloseBtn = document.getElementById('close-generic-modal');
genericModalCloseBtn.addEventListener('click', closeGenericModal);

addEventListener('load', async (event) => {
  tagLevelOptions = await getTagLevelOptions();
});

function closeModal(userProfileElements) {
  overlay.classList.add('hidden');
  const errorDiv = document.querySelector('.error-div');
  if (errorDiv) {
    errorDiv.remove();
    return;
  }
  if (userProfileElements) {
    // removing user profile elements that are appended to modal
    userProfileElements.forEach((element) => {
      element.remove();
    });
  }
}

function closeGenericModal() {
  document.getElementById('generic-modal').style.visibility = 'collapse';
  const containerDiv = document.getElementById('container-div');
  containerDiv.innerHTML = '';
}

async function appendUserProfileElements(username) {
  try {
    overlay.classList.remove('hidden');
    const { user } = await getUserData(username);
    const { skills } = await getUserSkills(user.id);
    const skillsDiv = createSkillsDiv(skills, user.id);
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
      openAddSkillModal(user.id, skillsDiv, skills),
    );
    skillTitle.appendChild(title);
    skillTitle.appendChild(addBtn);
    modal.appendChild(skillTitle);
    modal.appendChild(skillsDiv);

    const activityBtn = createUserActivityBtn(username);
    modal.appendChild(activityBtn);
    userProfileElements = [
      skillTitle,
      skillsDiv,
      activityBtn,
      userName,
      userImg,
    ];
  } catch (err) {
    addErrorMessage(modal);
    console.log(err);
  }
}

function createSkillsDiv(skills, userId) {
  const skillsDiv = createElement({
    type: 'div',
    attributes: { class: 'roles-div' },
  });
  skills.map((role) => {
    skillsDiv.append(
      skillElement(role.tagName, role.levelName, role.tagId, userId, skills),
    );
  });
  return skillsDiv;
}

function openAddSkillModal(userId, skillsDiv, skills) {
  const tags = tagLevelOptions.tags;
  const levels = tagLevelOptions.levels;
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

  for (let i = 0; i < tags.length; i++) {
    const option = createElement({
      type: 'option',
      attributes: { class: 'options' },
      innerText: tags[i].name,
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

  for (let i = 0; i < levels.length; i++) {
    const option = createElement({
      type: 'option',
      attributes: { class: 'option' },
      innerText: levels[i].name,
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

  containerDiv.appendChild(mainTitle);
  containerDiv.appendChild(skillCategoryDiv);
  containerDiv.appendChild(skillLevelDiv);
  containerDiv.appendChild(submitBtn);

  submitBtn.addEventListener('click', async () => {
    const tagToAdd = tags?.find(
      (tag) => tag.name === skillCategorySelect.value,
    );
    const levelToAdd = levels?.find(
      (lvl) => lvl.name === skillLevelSelect.value,
    );
    const isSkillExists = skills.find((skill) => skill.tagId === tagToAdd.id);
    if (isSkillExists) {
      alert('skill already exists');
      return;
    }
    const loaderElement = createElement({
      type: 'div',
      attributes: { class: 'dot-flashing-loader' },
    });
    submitBtn.innerText = '';
    submitBtn.append(loaderElement);
    submitBtn.classList.add('disabled');
    const response = await addSkillToUser(tagToAdd, levelToAdd, userId);
    loaderElement.remove();
    submitBtn.innerText = `Add Skill`;
    submitBtn.classList.remove('disabled');
    if (response.ok) {
      skills.push({
        itemId: userId,
        itemType: 'USER',
        levelId: levelToAdd.id,
        levelName: levelToAdd.name,
        levelNumber: levelToAdd.levelNumber,
        tagId: tagToAdd.id,
        tagName: tagToAdd.name,
        tagType: 'SKILL',
      });
    }
    skillsDiv.append(
      skillElement(tagToAdd.name, levelToAdd.name, tagToAdd.id, userId, skills),
    );
  });
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
        appendUserProfileElements,
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

export { modalOverlay };
