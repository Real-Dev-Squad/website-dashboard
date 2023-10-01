const Status = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  DENIED: 'DENIED',
};

const Order = {
  DESCENDING: 'desc',
  ASCENDING: 'asc',
};

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
        queryString = key + ':' + value.join('+');
      } else {
        queryString = key + ':' + value;
      }
      queryStringList.push(queryString);
    } else {
      urlSearchParams.append(key, value);
    }
  }
  if (queryStringList.length > 0)
    urlSearchParams.append('q', queryStringList.join(','));

  const uri = `/extension-requests?${urlSearchParams.toString()}`;
  return uri;
};
async function updateExtensionRequest({ id, body }) {
  const url = `${API_BASE_URL}/extension-requests/${id}`;
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

function dateDiff(date1, date2, formatter) {
  if (date2 > date1) {
    return dateDiff(date2, date1, formatter);
  }

  const timeDifference = new Date(date1).getTime() - new Date(date2).getTime();

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let res;
  if (seconds < 60) {
    res = `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  } else if (minutes < 60) {
    res = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  } else if (hours < 24) {
    res = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else if (days < 30) {
    res = `${days} ${days === 1 ? 'day' : 'days'}`;
  } else if (months < 12) {
    res = `${months} ${months === 1 ? 'month' : 'months'}`;
  } else {
    res = `${years} ${years === 1 ? 'year' : 'years'}`;
  }

  return formatter ? formatter(res) : res;
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

const dateTimeString = (timestamp) => {
  return new Date(timestamp).toISOString().substring(0, 16);
};

const fullDateString = (timestamp) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(timestamp);
  return `${daysOfWeek[date.getDay()]}, ${date.toLocaleString()}`;
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
