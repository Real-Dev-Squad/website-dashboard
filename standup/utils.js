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

function createLoaderElement() {
  const loaderElement = document.createElement('div');
  loaderElement.classList.add('loader');
  const wrapperElement = document.createElement('div');
  wrapperElement.classList.add('wrapper');
  const circleElement = document.createElement('div');
  circleElement.classList.add('circle');
  const line1Element = document.createElement('div');
  line1Element.classList.add('line-1');
  const line2Element = document.createElement('div');
  line2Element.classList.add('line-2');
  wrapperElement.appendChild(circleElement);
  wrapperElement.appendChild(line1Element);
  wrapperElement.appendChild(line2Element);
  loaderElement.appendChild(wrapperElement);
  return loaderElement;
}
