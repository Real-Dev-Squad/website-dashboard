function addClass(element, className) {
  element.classList.add(className);
}

function removeClass(element, className) {
  element.classList.remove(className);
}

async function makeApiCall(
  url,
  method = 'get',
  body = null,
  credentials = 'include',
  headers = { 'content-type': 'application/json' },
  options = null,
) {
  try {
    const response = await fetch(url, {
      method,
      body,
      headers,
      credentials,
      ...options,
    });
    return response;
  } catch (err) {
    console.error(MESSAGE_SOMETHING_WENT_WRONG, err);
    return err;
  }
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
