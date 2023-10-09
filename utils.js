async function getSelfUser(endpoint = '/users/self') {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });
    if (endpoint === '/users/self') {
      const self_user = await res.json();
      if (res.status === 200) {
        return self_user;
      }
    } else {
      location.reload();
    }
  } catch (err) {}
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
  removeLoader('loader');
  if (!container) return;
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

function removeLoader(classname = 'loader') {
  const loader = document.querySelector(`.${classname}`);
  if (loader) loader.remove();
}

function debounce(func, delay) {
  let timerId;
  return (...args) => {
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

async function addDelay(milliSeconds) {
  await new Promise((resolve) => setTimeout(resolve, milliSeconds));
}
