import {
  getTaskLogs,
  getUserData,
  getSelfDetails,
  createElement,
  getData,
  addLoader,
  addErrorMessage,
  removeLoader,
} from './utils.js';

import { createEventCard } from './logCard.js';

const container = document.getElementById('task-events-container');
const modal = document.getElementById('modal');
const overlay = document.querySelector('.overlay');

const closeBtn = document.getElementById('close-btn');
closeBtn.addEventListener('click', closeModal);
const closeBtn2 = document.getElementById('close-btn2');
closeBtn2.addEventListener('click', closeGenericModal);

async function createProfileModal(username) {
  try {
    overlay.style.display = 'block';
    const { user } = await getUserData(username);
    // another call for roles will be made when we have userSkills collection
    const userImg = createElement({
      type: 'img',
      attributes: { src: user.picture.url, alt: 'user img', class: 'user-img' },
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
      attributes: { class: 'skill-title' },
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
  } catch (err) {
    addErrorMessage(modal);
    console.log(err);
  }
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
      attributes: { class: 'remove-btn', id: index },
      innerText: 'x',
    });
    removeBtn.addEventListener('click', removeSkill);
    element.appendChild(removeBtn);
    rolesDiv.append(element);
  });
  const addBtn = createElement({
    type: 'button',
    attributes: { class: 'add-btn' },
    innerText: '+',
  });
  addBtn.addEventListener('click', openAddSkillModal);
  rolesDiv.appendChild(addBtn);
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
  overlay.style.display = 'none';
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

function removeSkill(e) {
  // this is not how it's going to be done, when we have the userSkills this function is going to change
  e.target.parentElement.remove();
}

function openAddSkillModal() {
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
      innerText: skills[i],
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
      innerText: level[i],
    });
    skillLevelSelect.appendChild(option);
  }

  skillLevelDiv.appendChild(skillLevelLabel);
  skillLevelDiv.appendChild(skillLevelSelect);

  const submitBtn = createElement({
    type: 'button',
    attributes: { class: 'submit-btn' },
    innerText: 'Add Skill',
  });

  // once we have the tags collection we can make an API call here to add that skill tag to user, when the super user clicks on submit

  containerDiv.appendChild(mainTitle);
  containerDiv.appendChild(skillCategoryDiv);
  containerDiv.appendChild(skillLevelDiv);
  containerDiv.appendChild(submitBtn);
}

async function openUserActivityModal(username) {
  document.getElementById('close-btn2').disabled = true;
  document.getElementById('generic-modal').style.visibility = 'visible';
  const containerDiv = document.getElementById('container-div');

  await renderCard(containerDiv, `${username}'s Task Logs`, username);
  document.getElementById('close-btn2').disabled = false;
}

async function renderCard(container, title, username, isAllTasks) {
  try {
    addLoader(container);
    const mainTitle = createElement({
      type: 'h1',
      attributes: { class: 'main-title' },
      innerText: title,
    });
    const { logs } = await getTaskLogs(username);
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
        isAllTasks,
        createProfileModal,
      ),
    );
    container.prepend(mainTitle);
  } catch (error) {
    // in case our API call fails we need to enable that button
    document.getElementById('closeBtn2').disabled = false;
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
      renderCard(container, 'All Task Logs', null, true);
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
