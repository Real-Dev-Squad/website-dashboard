import { API_BASE_URL } from "./url";

async function getTaskLogs() {
  const res = await fetch(`${API_BASE_URL}/logs/tasks`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });

  const task_logs = await res.json();
  return task_logs;
}

export {getTaskLogs}