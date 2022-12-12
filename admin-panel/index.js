import { createElement } from './utils.js';
const mainContainer = document.getElementById('main-container');
const main = document.getElementById('main');
const loading = document.getElementById('loading');
const selectElement = document.getElementById('select-tags');
const BASE_URL = 'https://api.realdevsquad.com';
(async function setAuth() {
  try {
    const res = await fetch(`${BASE_URL}/users/self`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    const selfDetails = await res.json();

    if (!selfDetails.roles.super_user) {
      mainContainer.innerHTML = 'You are not authorized to view this page';
    }
  } catch (err) {
    alert('something went wrong');
  } finally {
    loading.classList.add('hidden');
    mainContainer.classList.remove('hidden');
  }
})();

function createTagCreationComponent() {
  const title = createElement({
    type: 'h2',
    attributes: { class: 'title' },
    innerText: 'Create Skill Tags',
  });
  const tagCreationContainer = createElement({
    type: 'div',
    attributes: { class: 'tag-create__container' },
  });
  const tagNameInput = createElement({
    type: 'input',
    attributes: {
      class: 'input',
      placeholder: 'Enter Skill Name',
      id: 'skill',
    },
  });
  const submit = createElement({
    type: 'button',
    attributes: { class: 'submit-button' },
    innerText: 'Create Skill',
  });
  submit.addEventListener('click', createSkill);
  tagCreationContainer.appendChild(title);
  tagCreationContainer.appendChild(tagNameInput);
  tagCreationContainer.appendChild(submit);
  return tagCreationContainer;
}

async function createLevel() {
  const button = document.querySelector('.submit-button');
  try {
    const inputValue = document.getElementById('level').value;
    const levelValue = document.querySelector('.level-selector').value;
    const body = {
      name: inputValue,
      value: levelValue,
    };
    console.log(body);
    setLoadingState();
    button.textContent = 'Creating Level...';

    const response = await fetch(`${BASE_URL}/levels`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
      },
    });
    const data = await response.json();
    const { message } = data;
    alert(message);
  } catch (err) {
    alert(err);
  } finally {
    removeLoadingState();
    button.textContent = 'Create Level';
  }
}

async function createSkill() {
  const button = document.querySelector('.submit-button');
  try {
    const inputValue = document.getElementById('skill').value;

    const body = {
      name: inputValue,
      type: 'SKILL',
      reason: 'adding skills to users',
    };

    setLoadingState();
    button.textContent = 'creating skill...';

    const response = await fetch(`${BASE_URL}/tags`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
      },
    });

    const data = await response.json();
    const { message } = data;
    alert(message);
  } catch (err) {
    alert(err);
  } finally {
    removeLoadingState();
    button.textContent = 'Create Skill';
  }
}

function createLevelSelector() {
  const totalLevels = 10;
  const levelSelector = createElement({
    type: 'select',
    attributes: { class: 'level-selector' },
  });

  for (let i = 0; i <= totalLevels; i++) {
    const option = createElement({
      type: 'option',
      attributes: { class: 'option', value: i },
      innerText: i,
    });
    levelSelector.append(option);
  }
  return levelSelector;
}

function createLevelCreationComponent() {
  const title = createElement({
    type: 'h2',
    attributes: { class: 'title' },
    innerText: 'Create Level Tags',
  });
  const levelCreationContainer = createElement({
    type: 'div',
    attributes: { class: 'level-create__container' },
  });
  const levelNameInput = createElement({
    type: 'input',
    attributes: {
      class: 'input',
      id: 'level',
      placeholder: 'Enter Level Name',
    },
  });
  const levelSelector = createLevelSelector();
  const submit = createElement({
    type: 'button',
    attributes: { class: 'submit-button' },
    innerText: 'Create Level',
  });
  submit.addEventListener('click', createLevel);
  levelCreationContainer.appendChild(title);
  levelCreationContainer.appendChild(levelNameInput);
  levelCreationContainer.appendChild(levelSelector);
  levelCreationContainer.appendChild(submit);
  return levelCreationContainer;
}

function setLoadingState() {
  document.querySelector('.submit-button').disabled = true;
  document.getElementById('select-tags').disabled = true;
}

function removeLoadingState() {
  document.querySelector('.submit-button').disabled = false;
  document.getElementById('select-tags').disabled = false;
}

selectElement.addEventListener('change', () => {
  switch (selectElement.value) {
    case 'option1':
      main.innerHTML = '';
      const skillCreateContainer = createTagCreationComponent();
      main.append(skillCreateContainer);
      break;
    case 'option2':
      main.innerHTML = '';
      const levelCreateContainer = createLevelCreationComponent();
      main.append(levelCreateContainer);
      break;
  }
});
