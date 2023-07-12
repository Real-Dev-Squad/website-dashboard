async function getExtensionRequests(query = {}) {
  const url = new URL(`${API_BASE_URL}/extension-requests`);

  queryParams = ['assignee', 'status', 'taskId'];
  queryParams.forEach(
    (key) => query[key] && url.searchParams.set(key, query[key]),
  );

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
    let contentElement;
    if (time) contentText = getTimeFromTimestamp(data[key]);
    else if (title === 'Title' && className === 'extension-request') {
      let anchorTag = createElement({
        type: 'a',
        innerText: data[title.toLowerCase()],
        attributes: {
          href: `https://status.realdevsquad.com/tasks/${data['taskId']}`,
          target: '_blank',
        },
      });
      contentElement = anchorTag;
    } else {
      contentText = key ? data[key] : data[title.toLowerCase()];
    }

    let tableData = createElement({
      type: 'td',
      innerText: contentText,
      attributes: {
        class: bold ? 'bold' : '',
      },
    });

    if (contentElement) {
      tableData.appendChild(contentElement);
    }

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
