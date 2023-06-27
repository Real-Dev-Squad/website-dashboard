async function makeApiCall(url, method, body, credentials, headers, options) {
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
    console.error(err);
    throw err;
  }
}

function createElement({ type, classList }) {
  const element = document.createElement(type);
  element.classList.add(...classList);
  return element;
}
