const BASE_URL = window.API_BASE_URL;

function createElement({ type, attributes = {}, innerText }) {
  const element = document.createElement(type);
  Object.keys(attributes).forEach((item) => {
    element.setAttribute(item, attributes[item]);
  });
  element.textContent = innerText;
  return element;
}

async function getApplications({
  applicationStatus,
  size = 6,
  next = '',
  dev = false,
}) {
  let url;

  if (next) url = `${BASE_URL}${next}`;
  else if (applicationStatus === 'all') {
    url = `${BASE_URL}/applications?size=${size}`;
  } else {
    url = `${BASE_URL}/applications?size=${size}&status=${applicationStatus}`;
    if (dev) {
      url += '&dev=true';
    }
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });
    const data = res.json();
    return data;
  } catch (error) {
    console.error(error);
    const errorMessage = error?.message || 'Something went wrong!';
    showToastMessage({
      isDev: dev,
      oldToastFunction: showToast,
      type: 'error',
      message: errorMessage,
    });
  }
}

async function getApplicationById(applicationId) {
  try {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw error;
    }

    const data = await res.json();
    return data.application;
  } catch (error) {
    throw error;
  }
}

async function getIsSuperUser(isDev) {
  try {
    const res = await fetch(`${BASE_URL}/users?profile=true`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });
    const self_user = await res.json();
    return self_user?.roles['super_user'];
  } catch (error) {
    console.error(error);
    const errorMessage = error?.message || 'Something went wrong!';
    showToastMessage({
      isDev,
      oldToastFunction: showToast,
      type: 'error',
      message: errorMessage,
    });
  }
}

async function updateApplication({ applicationPayload, applicationId }) {
  try {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}`, {
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify(applicationPayload),
      headers: {
        'Content-type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw error;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
}

function showToast({ message, type }) {
  toast.innerText = message;

  if (type === 'success') {
    toast.classList.add('success');
    toast.classList.remove('failure');
  } else {
    toast.classList.add('failure');
    toast.classList.remove('success');
  }

  toast.classList.remove('hidden');
  toast.classList.add('animated_toast');

  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('animated_toast');
  }, 3000);
}

export {
  createElement,
  getApplications,
  getApplicationById,
  updateApplication,
  getIsSuperUser,
  showToast,
};
