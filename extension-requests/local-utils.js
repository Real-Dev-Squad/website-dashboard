async function getExtensionRequests(query = {}) {
  const url = new URL(`${API_BASE_URL}/extensionRequests`);

  const { assignee, status, taskId } = query;
  if (assignee) url.searchParams.set('assignee', assignee);
  if (status) url.searchParams.set('status', status);
  if (taskId) url.searchParams.set('taskId', taskId);

  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  return await res.json();
}

async function createExtensionRequestStatus({ extensionRequest }) {
  const url = `${API_BASE_URL}/extensionRequests`;
  const res = await fetch(url, {
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify(extensionRequest),
    headers: {
      'Content-type': 'application/json',
    },
  });
  return await res.json();
}

async function updateExtensionRequestStatus({ id, status }) {
  const url = `${API_BASE_URL}/extensionRequests/${id}/status`;
  const res = await fetch(url, {
    credentials: 'include',
    method: 'PATCH',
    body: JSON.stringify({ status }),
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
  const main = createElement({
    type: 'table',
    attributes: {
      class: className,
    },
  });
  const content = createElement({ type: 'tbody' });
  headings.forEach(({ title, key, time, bold }) => {
    let row = createElement({ type: 'tr' });
    let heading = createElement({ type: 'th', innerText: title });

    let contentText = '';
    if (time) contentText = getTimeFromTimestamp(data[key]);
    else contentText = key ? data[key] : data[title.toLowerCase()];

    let text = createElement({
      type: 'td',
      innerText: contentText,
      attributes: {
        class: bold ? 'bold' : '',
      },
    });
    row.appendChild(heading);
    row.appendChild(text);
    content.appendChild(row);
  });

  main.appendChild(content);
  return main;
}
