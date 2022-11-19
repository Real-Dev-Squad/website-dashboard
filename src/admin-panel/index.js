import { createElement } from './utils.js';
const container = document.getElementById('container');
const selectElement = document.getElementById('select-tags');
const main = document.getElementById('main');

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
  const inputValue = document.getElementById('level').value;
  const body = {
    name: inputValue,
    levelnumber: inputValue,
  };
  console.log(inputValue);
  const response = await fetch(`http://localhost:4000/levels`, {
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
}

async function createSkill() {
  const inputValue = document.getElementById('skill').value;
  const body = {
    name: inputValue,
    type: 'SKILL',
    reason: 'adding skills to users',
  };

  const response = await fetch(`http://localhost:4000/tags`, {
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
}

function createLevelSelector() {
  const levelSelector = createElement({
    type: 'select',
    attributes: { class: 'level-selector' },
  });

  for (let i = 0; i <= 5; i++) {
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
