async function getSelfUser() {
  const res = await fetch(`${API_BASE_URL}/users/self`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const self_user = await res.json();
  return self_user;
}

async function checkUserIsSuperUser() {
  const self_user = await getSelfUser();
  return self_user?.roles['super_user'];
}

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
  const loadertext = createElement({
    type: 'p',
    attributes: { class: 'loader-text' },
    innerText: 'Loading...',
  });
  loader.appendChild(loadertext);
  container.appendChild(loader);
}

function removeLoader() {
  document.querySelector('.loader').remove();
}
