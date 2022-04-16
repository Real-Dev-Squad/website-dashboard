'use strict';

const API_BASE_URL = 'https://api.realdevsquad.com';
const mockData = [
  {
    flagId: 1,
    title: 'Dark Mode',
    enabled: true,
    roles: ['members', 'no_role', 'super_user'],
    users: {
      pcBpdEQ5ydRakHHSpY2p: true,
      quEpdE34ydRakJSpY45p: false,
    },
  },
  {
    flagId: 2,
    title: 'Light Mode',
    enabled: false,
    roles: [],
    users: {
      pcBpdEQ5ydRakHHSpY2p: true,
      quEpdE34ydRakJSpY45p: true,
    },
  },
];

function customCreateElement({ type = 'div', attribute = {}, text = null }) {
  const element = document.createElement(type);

  // Sets all the attributes
  Object.keys(attribute).forEach((key) => {
    element.setAttribute(key, attribute[key]);
  });

  if (text) {
    element.textContent = text;
  }

  return element;
}

async function fetchFlags() {
  // const data = await fetch(`${API_BASE_URL}/flag`).then(res => res.json());
  // return data.flags;
  return mockData;
}

function renderFlags(flags) {
  const flagDropdown = document.getElementById('flag-dropdown');
  flags.forEach((flag) => {
    const element = customCreateElement({
      type: 'option',
      attribute: { value: flag.flagId },
      text: flag.title,
    });
    flagDropdown.append(element);
  });
}

// Listeners
function configureListeners() {
  handleAddFlagButtonClick();
}

function handleAddFlagButtonClick() {
  const addFlagBtn = document.querySelector('.add-button');
  addFlagBtn.addEventListener('click', (e) => {
    e.target.classList.add('add-button--active');
  });
}

// Submit
function getFlagFormData(form, applicationState) {
  const data = new FormData(form);
  const result = {};

  result.title = data.get('title');
  result.roles = data.getAll('role');
  result.enabled = data.get('enabled') ? true : false;
  return result;
}
