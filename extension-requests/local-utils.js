const Status = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  DENIED: 'DENIED',
};
async function getExtensionRequests(query = {}) {
  const url = new URL(`${API_BASE_URL}/extension-requests`);

  queryParams = ['assignee', 'status', 'taskId'];
  queryParams.forEach((key) => {
    if (query[key]) {
      if (Array.isArray(query[key])) {
        query[key].forEach((value) => url.searchParams.append(key, value));
      } else {
        url.searchParams.append(key, query[key]);
      }
    }
  });

  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  return await res.json();
}

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
  return await res.json();
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

function getTimeFromTimestamp(timestamp) {
  return new Date(timestamp * 1000).toLocaleString();
}

function formatTimestampToCustomDate(timestamp) {
  const date = new Date(timestamp);

  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
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
    if (time) contentText = formatTimestampToCustomDate(data[key]);
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

function formatDateToHumanReadable(date) {
  const now = new Date();
  const inputDate = new Date(date);

  const timeDifference = now.getTime() - inputDate.getTime();

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (days < 30) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (months < 12) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}
