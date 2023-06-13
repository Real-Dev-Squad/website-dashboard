function addErrorMessage(container) {
  const errorDiv = createElement({
    type: 'div',
    attributes: { class: 'error-div' },
  });
  const errorMsg = createElement({
    type: 'p',
    attributes: { class: 'error-message' },
    innerText: 'Something went wrong!',
  });
  errorDiv.appendChild(errorMsg);
  container.appendChild(errorDiv);
}

async function getTaskLogs(username) {
  const url = username
    ? `${API_BASE_URL}/logs/task?meta.username=${username}`
    : `${API_BASE_URL}/logs/task`;
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
  const res = await fetch(`${API_BASE_URL}/tasks/${id}/details`, {
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
  const res = await fetch(`${API_BASE_URL}/users/${username}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const userData = await res.json();
  return userData;
}

async function getData(data) {
  const newData = data?.body.new;
  const userName = data?.meta.username;
  const taskId = data?.meta.taskId;
  const { taskData } = await getTaskData(taskId);

  return {
    ...taskData,
    newData,
    userName,
  };
}

async function getUserSkills(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/skills`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });
    if (response.status === 500) {
      alert('server error');
      console.log(response);
      return;
    }
    const userSkills = await response.json();
    return userSkills;
  } catch (error) {
    alert('something went wrong');
    console.log(error);
  }
}

async function getTagLevelOptions() {
  try {
    const levelsResponse = await fetch(`${API_BASE_URL}/levels`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });
    const tagsResponse = await fetch(`${API_BASE_URL}/tags`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    if (tagsResponse.status === 500 || levelsResponse.status === 500) {
      alert('server error');
      console.log(response);
      return;
    }
    const { tags } = await tagsResponse.json();
    let { levels } = await levelsResponse.json();
    levels = levels.sort((a, b) => {
      if (a.value < b.value) return -1;
      if (a.value > b.value) return 1;
      return 0;
    });
    return { levels, tags };
  } catch (error) {
    alert(`something went wrong`);
    console.error(error);
  }
}

async function addSkillToUser(tagToAdd, levelToAdd, userId) {
  const body = {
    itemId: userId,
    itemType: 'USER',
    tagPayload: [
      {
        levelId: levelToAdd?.id,
        tagId: tagToAdd?.id,
      },
    ],
  };
  try {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
      },
    });
    if (response.status === 500) {
      alert('server error');
      console.log(response);
      return;
    }
    return response;
  } catch (error) {
    alert('something went wrong');
    console.error(error);
  }
}

async function removeSkillFromUser(tagId, userId) {
  const body = {
    itemId: userId,
    tagId,
  };
  try {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (response.status === 500) {
      alert('server error');
      console.log(response);
      return;
    }
    return response;
  } catch (error) {
    alert('something went wrong');
    console.error(error);
  }
}

export {
  createElement,
  addLoader,
  addErrorMessage,
  getTaskLogs,
  getTaskData,
  getUserData,
  getData,
  removeLoader,
  getUserSkills,
  getTagLevelOptions,
  addSkillToUser,
  removeSkillFromUser,
};
