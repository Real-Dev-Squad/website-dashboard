const BASE_URL = 'http://localhost:3000';

function createElement({ type, attributes = {}, innerText }) {
  const element = document.createElement(type);
  Object.keys(attributes).forEach((item) => {
    element.setAttribute(item, attributes[item]);
  });
  element.textContent = innerText;
  return element;
}

async function getApplications({ applicationStatus, size = 5, next = '' }) {
  let url;

  if (next) url = `${BASE_URL}${next}`;
  else if (applicationStatus === 'all') {
    url = `${BASE_URL}/applications?size=${size}`;
  } else {
    url = `${BASE_URL}/applications?size=${size}&status=${applicationStatus}`;
  }

  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const data = res.json();
  return data;
}

export { createElement, getApplications };
