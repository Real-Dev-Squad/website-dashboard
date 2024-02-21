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

/**
 * Parses the query parameters from the URLSearchParams object and organizes them into an object.
 *
 * @param {URLSearchParams} searchParams - The URLSearchParams object that needs to be parsed.
 * @returns {Object.<string, string[]>} An object containing query parameter keys as properties
 * and arrays of corresponding values.
 * */
function parseQueryParams(searchParams) {
  const queryObject = {};

  searchParams.forEach((value, key) => {
    if (!queryObject[key]) {
      queryObject[key] = [];
    }
    queryObject[key].push(value);
  });
  return queryObject;
}

function formURLQueryString(queryStates, isDev) {
  const urlParams = new URLSearchParams();

  if (queryStates.order) {
    let sortQueryString = Order[queryStates.order];
    const key = Object.keys(sortQueryString)[0];
    const value = sortQueryString[key];
    sortQueryString = key + '-' + value;
    urlParams.append('sort', sortQueryString);
  }
  if (queryStates.status) {
    if (Array.isArray(queryStates.status)) {
      queryStates.status.forEach((_, index) => {
        urlParams.append('status', queryStates.status[index]);
      });
    } else {
      urlParams.append('status', queryStates.status);
    }
  }
  if (queryStates.requestType) {
    queryStates.requestType.forEach((_, index) =>
      urlParams.append('request-type', queryStates.requestType[index]),
    );
  }

  if (isDev) {
    urlParams.append('dev', 'true');
  }

  return '?' + urlParams.toString().trim();
}
