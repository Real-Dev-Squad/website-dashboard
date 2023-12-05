function goToAuthPage() {
  const authUrl = `https://github.com/login/oauth/authorize?client_id=23c78f66ab7964e5ef97&}&state=${window.location.href}`;

  window.open(authUrl, '_self');
}

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
        return self_user?.user || self_user;
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

export function createElement({ type, attributes = {}, innerText }) {
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
function dateDiff(date1, date2, formatter) {
  if (date2 > date1) {
    return dateDiff(date2, date1, formatter);
  }

  const timeDifference = new Date(date1).getTime() - new Date(date2).getTime();

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let res;
  if (seconds < 60) {
    res = `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  } else if (minutes < 60) {
    res = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  } else if (hours < 24) {
    res = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else if (days < 30) {
    res = `${days} ${days === 1 ? 'day' : 'days'}`;
  } else if (months < 12) {
    res = `${months} ${months === 1 ? 'month' : 'months'}`;
  } else {
    res = `${years} ${years === 1 ? 'year' : 'years'}`;
  }

  return formatter ? formatter(res) : res;
}

const generateRqlQuery = (filterQueries, sortQueries) => {
  let queryString = '';
  if (filterQueries) {
    Object.entries(filterQueries).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        queryString += value
          .map((valueElement) => key + ':' + valueElement)
          .join(' ');
      } else {
        queryString += key + ':' + value;
      }
      queryString += ' ';
    });
  }

  if (sortQueries) {
    Object.entries(sortQueries).forEach(([key, value]) => {
      queryString += 'sort:' + key + '-' + value;
    });
  }

  return queryString.trim();
};
