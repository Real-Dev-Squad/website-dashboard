function createElementFromMap(domObjectMap) {
  if (
    !domObjectMap ||
    typeof domObjectMap !== 'object' ||
    !domObjectMap.tagName
  ) {
    throw new Error('Invalid domObjectMap. tagName is required.');
  }
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

function getOooQueryParamsString(query) {
  let queryParam = 'dev=true&type=OOO&size=12';
  if (
    query.state !== undefined &&
    query.state !== null &&
    query.state !== 'ALL'
  ) {
    queryParam += `&state=${query.state}`;
  }
  return `?${queryParam}`;
}
function addEmptyPageMessage(container) {
  const emptyPageMessage = createElement({
    type: 'p',
    attributes: { class: 'page-message' },
    innerText: 'No extension requests to show!',
  });
  container.appendChild(emptyPageMessage);
}

async function getAllUsersStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/users/status`, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
    });
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}

async function updateExtensionRequestStatus({ id, body }) {
  const url = `${API_BASE_URL}/extension-requests/${id}/status`;
  const res = await fetch(url, {
    credentials: 'include',
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-type': 'application/json',
    },
  });

  if (res.status < 200 || res.status > 300) {
    throw new Error('Update failed.');
  }

  return await res.json();
}

function getExtensionQueryParamsString(query) {
  const params = new URLSearchParams();
  params.append('order', query.order || 'asc');
  params.append('size', query.size || '5');
  if (query.status !== '') {
    if (query.status) {
      params.append('q', `status:${query.status}`);
    } else {
      params.append('q', 'status:APPROVED PENDING DENIED');
    }
  }
  for (const key in query) {
    if (query.hasOwnProperty(key) && !['order', 'size', 'status'].includes(key)) {
      params.append(key, query[key]);
    }
  }
  return `?${params.toString()}`;

}
const Order = {
  DESCENDING: 'desc',
  ASCENDING: 'asc',
};
function addErrorElement(container) {
  const errorHeading = createElement({
    type: 'h2',
    innerText: ERROR_MESSAGE_RELOAD,
  });
  container.appendChild(errorHeading);
}
async function getTaskDetails(taskId) {
  if (!taskId) return;
  const url = `${API_BASE_URL}/tasks/${taskId}/details`;
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  return await res.json();
}
function secondsToMilliSeconds(seconds) {
  return seconds * 1000;
}
const fullDateString = (timestamp) => {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    hour12: true,
  };
  return new Intl.DateTimeFormat('en-US', options).format(new Date(timestamp));
};

const parseExtensionRequestParams = (uri, nextPageParamsObject) => {
  const urlSearchParams = new URLSearchParams(uri);

  for (const [key, value] of urlSearchParams.entries()) {
    if (key === 'q') {
      const searchQueries = value.split(',');
      searchQueries.forEach((query) => {
        if (!query) return;
        const [queryKey, queryValue] = query.split(':');
        if (queryValue?.includes('+')) {
          nextPageParamsObject[queryKey] = queryValue.split('+');
        } else if (queryValue) {
          nextPageParamsObject[queryKey] = queryValue;
        }
      });
    } else {
      nextPageParamsObject[key] = value;
    }
  }
  return nextPageParamsObject;
};

function dateString(milliseconds) {
  const date = new Date(milliseconds);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
}
async function getExtensionRequestLogs({ extensionRequestId }) {
  const url = `${API_BASE_URL}/logs/extensionRequests/?meta.extensionRequestId=${extensionRequestId}`;
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });

  if (res.status < 200 || res.status > 300) {
    throw new Error('Update failed.');
  }

  return await res.json();
}

function convertDateToReadableStringDate(date, format) {
  if (format === undefined || format === null) {
    format = DEFAULT_DATE_FORMAT;
  }
  if (date !== undefined && date !== null) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(date)
      .toLocaleString('default', options)
      .replace('DD', new Date(date).getDate())
      .replace(
        'MMM',
        new Date(date).toLocaleString('default', { month: 'short' }),
      )
      .replace('YYYY', new Date(date).getFullYear());
  }
  return 'N/A';
}

function getFullNameOfUser(user) {
  if (!user || typeof user !== 'object') {
    return 'N/A';
  }
  const firstName = user.first_name || 'N/A';
  const lastName = user.last_name || '';
  return (
    firstName.charAt(0).toUpperCase() +
    firstName.slice(1).toLowerCase() +
    ' ' +
    lastName.charAt(0).toUpperCase() +
    lastName.slice(1).toLowerCase()
  );
}

function extractQueryParameters(url) {
  const searchParams = new URLSearchParams(url.split('?')[1]);
  const parameters = {};

  for (const [key, value] of searchParams.entries()) {
    parameters[key] = value;
  }
  return parameters;
}

async function getInDiscordUserList() {
  try {
    const res = await fetch(`${API_BASE_URL}/users/search?role=in_discord`, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
    });
    const data = await res.json();
    return data.users;
  } catch (error) {
    console.log(error);
  }
}

const addSpinner = (container) => {
  const spinner = createElement({
    type: 'div',
    attributes: { class: 'spinner' },
  });

  container.append(spinner);

  function removeSpinner() {
    spinner.remove();
  }

  return removeSpinner;
};

async function getRequestDetailsById(requestId) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/requests?dev=true&id=${requestId}`,
      {
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
        },
      },
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}
