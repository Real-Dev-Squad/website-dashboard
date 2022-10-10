const BASE_URL = 'https://api.realdevsquad.com/';

function createElement({ type, attributes = {}, innerText }) {
  const element = document.createElement(type);
  Object.keys(attributes).forEach((item) => {
    element.setAttribute(item, attributes[item]);
  });
  element.textContent = innerText;
  return element;
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

function addErrorMessage(container) {
  const errorDiv = createElement({
    type: 'div',
    attributes: { class: 'error-div' },
  });
  const errorMsg = createElement({
    type: 'p',
    attributes: { class: 'error-message' },
    innerText: 'Something went wrong!',
  });
  errorDiv.appendChild(errorMsg);
  container.appendChild(errorDiv);
}

async function getTaskLogs(username) {
  let url;
  if (username) {
    url = `${BASE_URL}/logs/tasks?meta.username=${username}`;
  } else {
    url = `${BASE_URL}/logs/tasks`;
  }
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });

  const task_logs = await res.json();
  return task_logs;
}

async function getTaskData(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}/details`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const task_details = await res.json();
  return task_details;
}

async function getUserData(username) {
  console.log(username);
  const res = await fetch(`${BASE_URL}/users/${username}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const userData = await res.json();
  return userData;
}

async function getSelfDetails() {
  const res = await fetch(`${BASE_URL}/users/self`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });

  const self_details = await res.json();
  return self_details;
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

export {
  createElement,
  addLoader,
  addErrorMessage,
  getTaskLogs,
  getTaskData,
  getUserData,
  getSelfDetails,
  getData,
  removeLoader,
};
