'use strict';

const API_BASE_URL = 'https://api.realdevsquad.com';
const roles = ['super_user', 'member', 'no_role'];
const mockData = [
  {
    flagId: '111',
    title: 'Dark Mode',
    enabled: true,
    roles: ['members', 'no_role', 'super_user'],
    users: {
      pcBpdEQ5ydRakHHSpY2p: true,
      quEpdE34ydRakJSpY45p: false,
    },
  },
  {
    flagId: '222',
    title: 'Light Mode',
    enabled: false,
    roles: [],
    users: {
      pcBpdEQ5ydRakHHSpY2p: true,
      quEpdE34ydRakJSpY45p: true,
    },
  },
];
const newFlagConfig = {
  flagId: '',
  title: '',
  enabled: true,
  roles: [],
  users: {},
};

function customCreateElement({ type = 'div', attribute = {}, text = null }) {
  const element = document.createElement(type);

  // Sets all the attributes
  Object.keys(attribute).forEach((key) => {
    element.setAttribute(key, attribute[key]);
  });

  if (text) element.textContent = text;

  return element;
}

// For mocking
const awaitTimeout = (delay) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

async function fetchFlags() {
  // const data = await fetch(`${API_BASE_URL}/flag`).then(res => res.json());
  // return data.flags;
  await awaitTimeout(2000);
  return mockData;
}

function setFlag(flag) {
  // Show the flag title name with Read Only
  // or remove flag name and remove readonly attribute
  const titleField = document.getElementById('flag-title');
  titleField.value = flag.title;
  flag.flagId
    ? titleField.setAttribute('readonly', '')
    : titleField.removeAttribute('readonly');

  // Sync up role checkboxes
  roles.forEach((value) => {
    const roleField = document.getElementById(`checkbox-${value}`);
    roleField.checked = flag.roles.includes(value);
  });

  // Sync up enable checkbox
  const enabledField = document.getElementById('form-enabled');
  enabledField.checked = flag.enabled;

  // Sync flagId
  document.getElementById('form-flagId').value = flag.flagId;
}

function renderFlagDropdown(flags) {
  flags.forEach((flag) => appendFlagToDropdown(flag));
}

function appendFlagToDropdown(flag) {
  const flagDropdown = document.getElementById('flag-dropdown');
  const element = customCreateElement({
    type: 'option',
    attribute: { value: flag.flagId },
    text: flag.title,
  });
  flagDropdown.append(element);
}

// Submit
function getFlagFormData(form) {
  const data = new FormData(form);
  const result = {};

  result.flagId = data.get('flagId');
  result.title = data.get('title');
  result.roles = data.getAll('role');
  result.enabled = data.get('enabled') ? true : false;
  result.users = {}; // TODO
  return result;
}

function toggleSubmitButton({ enable }) {
  const submitBtn = document.getElementById('form-submit');
  if (enable) {
    submitBtn.removeAttribute('disabled');
    submitBtn.classList.remove('submit-button__disabled');
  } else {
    submitBtn.setAttribute('disabled', true);
    submitBtn.classList.add('submit-button__disabled');
  }
}

async function updateFlagCall(flagId, data) {
  // Call the post /flag/:flagId api
  await awaitTimeout(2000);
  const index = flags.findIndex((flag) => flag.flagId === flagId);
  flags[index] = { flagId, ...data };

  alert('Flag updated successfully');
  toggleSubmitButton({ enable: true });
}

let mockFlagId = 1;
async function addFlagCall(data) {
  const validFlagTitle = validateFlagTitle(data.title);
  if (!validFlagTitle) {
    alert('Error! Flag title already exists');
    toggleSubmitButton({ enable: true });
    return;
  }
  // Call the post /flag api & disable submit button
  await awaitTimeout(2000);
  const flag = { flagId: `${mockFlagId++}`, ...data };
  appendFlagToDropdown(flag);
  flags.push(flag);

  alert('Flag added successfully');
  toggleSubmitButton({ enable: true });
}

function validateFlagTitle(title) {
  return !flags.some((flag) => flag.title === title);
}
