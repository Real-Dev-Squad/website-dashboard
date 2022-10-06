const BASE_URL = 'http://localhost:4000';

async function getTaskLogs(username) {
  let url;
  if (username) {
    url = `${BASE_URL}/logs/tasks?meta.username=${username}`;
  } else {
    url = `${BASE_URL}/logs/tasks`;
  }
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });

  const task_logs = await res.json();
  return task_logs;
}

async function getTaskData(id) {
  const res = await fetch(`${BASE_URL}/tasks/details/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const task_details = await res.json();
  return task_details;
}

async function getUserData(username) {
  console.log(username);
  const res = await fetch(`${BASE_URL}/users/${username}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const userData = await res.json();
  return userData;
}

export { getTaskLogs, getTaskData, getUserData };
