const BASE_URL =
  window.location.hostname === 'localhost'
    ? 'https://staging-api.realdevsquad.com'
    : window.API_BASE_URL;

const toast = document.getElementById('toast');

function createElement({ type, attributes = {}, innerText }) {
  const element = document.createElement(type);
  Object.keys(attributes).forEach((item) => {
    element.setAttribute(item, attributes[item]);
  });
  element.textContent = innerText;
  return element;
}

async function getIsSuperUser() {
  try {
    const res = await fetch(`${BASE_URL}/users/self`, {
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
    showToast({ message: errorMessage, type: 'error' });
  }
}

async function generateDiscordInviteLink(purpose) {
  const body = {
    purpose,
  };
  try {
    const res = await fetch(`${BASE_URL}/discord-actions/invite?dev=true`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    const errorMessage = error?.message || 'Something went wrong!';
    showToast({ message: errorMessage, type: 'error' });
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

export { createElement, getIsSuperUser, showToast, generateDiscordInviteLink };
