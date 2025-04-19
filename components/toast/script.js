const DEFAULT_TIMEOUT = 3000;
const SUCCESS_ICON_PATH = '/images/x-icon-green.svg';
const ERROR_ICON_PATH = '/images/x-icon-red.svg';

function createToast(type, message, timeout = DEFAULT_TIMEOUT) {
  const toastContainer = document.getElementById('toastComponent');
  if (!toastContainer) {
    console.error('Toast component container not found in the DOM');
    return;
  }

  toastContainer.replaceChildren();
  toastContainer.classList.remove(
    'toast__hidden',
    'success__toast',
    'error__toast',
    'hide',
  );
  toastContainer.classList.add(
    type === 'success' ? 'success__toast' : 'error__toast',
    'show',
  );

  const toastContent = document.createElement('p');
  toastContent.textContent = message;
  toastContent.setAttribute('data-testid', 'toast-message');

  const toastCloseButton = document.createElement('button');
  toastCloseButton.setAttribute('data-testid', 'toast-close-button');
  toastCloseButton.setAttribute('aria-label', 'Close notification');
  toastCloseButton.classList.add('toast__close__button');
  const img = document.createElement('img');
  img.src = type === 'success' ? SUCCESS_ICON_PATH : ERROR_ICON_PATH;
  img.alt = 'Close toast';
  toastCloseButton.appendChild(img);

  toastContainer.append(toastContent, toastCloseButton);

  toastCloseButton.addEventListener('click', () => {
    toastContainer.classList.remove('show');
    toastContainer.classList.add('hide');
  });

  setTimeout(() => {
    toastContainer.classList.remove('show');
    toastContainer.classList.add('hide');
  }, timeout);
}

function showToastMessage({ isDev, oldToastFunction, type, message }) {
  if (isDev) {
    createToast(type, message);
  } else if (oldToastFunction.length === 1) {
    oldToastFunction(message);
  } else {
    oldToastFunction(type, message);
  }
}
