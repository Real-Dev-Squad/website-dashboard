function createCustomElement(domObjectMap) {
  const el = document.createElement(domObjectMap.tagName);
  for (const [key, value] of Object.entries(domObjectMap)) {
    if (key === 'tagName') {
      continue;
    }
    if (key === 'eventListeners') {
      value.forEach((obj) => {
        el.addEventListener(obj.event, obj.func);
      });
    }
    if (key === 'class') {
      if (Array.isArray(value)) {
        el.classList.add(...value);
      } else {
        el.classList.add(value);
      }
    } else if (key === 'child') {
      el.append(...value);
    } else {
      el[key] = value;
    }
  }
  return el;
}

function getQueryParamsString(taskRequestStates) {
  let filterQueries = {};
  let sortQueries = {};

  if (taskRequestStates.status) {
    filterQueries.status = taskRequestStates.status;
  }
  if (taskRequestStates.requestType) {
    filterQueries['request-type'] = taskRequestStates.requestType;
  }
  if (taskRequestStates.order) {
    sortQueries = Order[taskRequestStates.order];
  }

  const queryString = generateRqlQuery(filterQueries, sortQueries);

  const urlParams = new URLSearchParams();
  if (taskRequestStates.size) {
    urlParams.append('size', taskRequestStates.size);
  }
  if (queryString) {
    urlParams.append('q', queryString);
  }
  if (taskRequestStates.dev) {
    urlParams.append('dev', true);
  }
  return '?' + urlParams.toString();
}

const addSpinner = (container) => {
  const spinner = createCustomElement({
    tagName: 'div',
    className: 'spinner',
  });

  container.append(spinner);

  function removeSpinner() {
    spinner.remove();
  }

  return removeSpinner;
};
