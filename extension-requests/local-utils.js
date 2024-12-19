const Status = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  DENIED: 'DENIED',
};

const Order = {
  DESCENDING: 'desc',
  ASCENDING: 'asc',
};
async function getSelfUser() {
  try {
    const res = await fetch(`${API_BASE_URL}/users?profile=true`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });
    const self_user = await res.json();
    if (res.status === 200) {
      return self_user;
    }
  } catch (err) {}
}
async function getExtensionRequests(query = {}, nextLink) {
  let finalUrl =
    API_BASE_URL + (nextLink || generateExtensionRequestParams(query));

  const res = await fetch(finalUrl, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  return await res.json();
}
const generateExtensionRequestParams = (nextPageParams) => {
  const queryStringList = [];
  const searchQueries = ['assignee', 'taskId', 'status'];
  const urlSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(nextPageParams)) {
    if (!value) continue;

    if (searchQueries.includes(key)) {
      let queryString;
      if (Array.isArray(value)) {
        if (value.length) queryString = key + ':' + value.join('+');
      } else {
        queryString = key + ':' + value;
      }
      if (queryString) queryStringList.push(queryString);
    } else {
      urlSearchParams.append(key, value);
    }
  }
  if (queryStringList.length > 0)
    urlSearchParams.append('q', queryStringList.join(','));

  const uri = `/extension-requests?${urlSearchParams.toString()}`;
  return uri;
};

/**
 * Parses the query parameters from a URL and stores them in the provided object.
 *
 * @param {string} uri - The URI string containing the query parameters.
 * @param {Object} nextPageParamsObject - The object in which the parsed parameters will be stored.
 * @returns {Object} The updated `nextPageParamsObject` containing the parsed parameters.
 *
 * @example
 * let params = {};
 * parseExtensionRequestParams("/?order=asc&size=5&q=status:APPROVED,assignee:sunny+randhir", params);
 * // params will be updated to:
 * // {
 * //   order: "asc",
 * //   size: "5",
 * //   status: "APPROVED",
 * //   assignee: ["sunny", "randhir"]
 * // }
 */
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

async function updateExtensionRequest({ id, body, underDevFeatureFlag }) {
  const url = underDevFeatureFlag
    ? `${API_BASE_URL}/extension-requests/${id}?dev=true`
    : `${API_BASE_URL}/extension-requests/${id}`;
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

async function getUserDetails(username) {
  if (!username) return;
  const url = `${API_BASE_URL}/users?search=${username}&size=1`;
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const user = await res.json();

  return user?.users[0];
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
    return await res.json();
  } catch (error) {
    console.log(error);
  }
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

function secondsToMilliSeconds(seconds) {
  return seconds * 1000;
}

function getTimeFromTimestamp(timestamp) {
  return new Date(timestamp * 1000).toLocaleString();
}

function createTable(headings, data, className = '') {
  const table = createElement({
    type: 'table',
    attributes: {
      class: className,
    },
  });
  const tableBody = createElement({ type: 'tbody' });
  headings.forEach(({ title, key, time, bold }) => {
    let row = createElement({ type: 'tr' });
    let rowHeading = createElement({ type: 'th', innerText: title });

    let contentText = '';
    if (time) contentText = getTimeFromTimestamp(data[key]);
    else contentText = key ? data[key] : data[title.toLowerCase()];

    let tableData = createElement({
      type: 'td',
      innerText: contentText,
      attributes: {
        class: bold ? 'bold' : '',
      },
    });
    row.appendChild(rowHeading);
    row.appendChild(tableData);
    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  return table;
}

function formDataToObject(formData) {
  if (!formData) return;
  const result = {};
  for (const [key, value] of formData.entries()) {
    result[key] = value;
  }
  return result;
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

/**
  Generates a formatted date-time string from milliseconds.*
  @param {number} milliseconds - The number of milliseconds since January 1, 1970 00:00:00 UTC.
  @returns {string} The formatted date-time string in the format 'YYYY-MM-DDTHH:mm'.
  
*/
function dateTimeString(milliseconds) {
  const date = new Date(milliseconds);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}T${String(
    date.getHours(),
  ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
  Generates a formatted date string from milliseconds.*
  @param {number} milliseconds - The number of milliseconds since January 1, 1970 00:00:00 UTC.
  @returns {string} The formatted date string in the format 'YYYY-MM-DD'.
  
*/
function dateString(milliseconds) {
  const date = new Date(milliseconds);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
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

const shortDateString = (timestamp) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(timestamp);

  const day = daysOfWeek[date.getDay()];
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
    date,
  );
  return `${day}, ${date.getDate()} ${month}`;
};

function addEmptyPageMessage(container) {
  const emptyPageMessage = createElement({
    type: 'p',
    attributes: { class: 'page-message' },
    innerText: 'No extension requests to show!',
  });
  container.appendChild(emptyPageMessage);
}

function addErrorElement(container) {
  const errorHeading = createElement({
    type: 'h2',
    innerText: ERROR_MESSAGE_RELOAD,
  });
  container.appendChild(errorHeading);
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
