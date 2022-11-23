const BASE_URL = 'http://localhost:3000';

function createElement({ type, attributes = {}, innerText, innerHTML }) {
  const element = document.createElement(type);
  Object.keys(attributes).forEach((item) => {
    element.setAttribute(item, attributes[item]);
  });
  if(innerHTML){
    element.innerHTML = innerHTML
  } else if(innerText){
    element.textContent = innerText;
  }
  return element;
}

function addLoader(container) {
  const loader = createElement({
    type: 'div',
    attributes: { class: 'loader' },
  });
  const loadertext = createElement({
    type: 'p',
    attributes: { class: 'loader-text' },
    innerText: 'Loading...',
  });
  loader.appendChild(loadertext);
  container.appendChild(loader);
}

function removeLoader() {
  document.querySelector('.loader').remove();
}

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
    ? `${BASE_URL}/logs/task?meta.username=${username}`
    : `${BASE_URL}/logs/task`;
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
  const res = await fetch(`${BASE_URL}/tasks/${id}/details`, {
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

async function getSelfDetails() {
  const res = await fetch(`${BASE_URL}/users/self`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });

  const self_details = await res.json();
  return self_details;
}

async function getData(data) {
  const messages = data?.body.messages;
  const userName = data?.meta.username;
  const taskId = data?.meta.taskId;
  const { taskData } = await getTaskData(taskId);

  return {
    ...taskData,
    messages,
    userName,
  };
}

async function getUserSkills(id){
  try{
    const res = await fetch(`${BASE_URL}/users/${id}/skills`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      }
    });
    
    const userSkills = await res.json();
    return userSkills;
  } catch (error) {
    console.log(error)
  }
}

async function getTagLevelOptions() {
  try{
    const levelsResponse = await fetch(`${BASE_URL}/levels`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      }
    });
    const tagsResponse = await fetch(`${BASE_URL}/tags`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      }
    });
    
    const { allTags } = await tagsResponse.json();
    let { allLevels } = await levelsResponse.json();
    allLevels = allLevels.sort((a,b) => {
      if(parseInt(a.name) < parseInt(b.name)) return -1;
      if(parseInt(a.name) > parseInt(b.name)) return 1;
      return 0
  }) 
    return { allLevels, allTags };
  } catch (error) {
    console.log(error)
  }
}

async function addSkillToUser(skillToAdd, levelToAdd, userid) {
  const body = {
    itemid: userid, 
    itemType: "USER",
    tagPayload: [{
        levelid: levelToAdd?.id,
        tagid: skillToAdd?.id
    }]
  }
  try{
    const response = await fetch(`${BASE_URL}/items`,{
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
      } 
    })
    await response.json()
  } catch(error) {
    console.log(error)
  }
}

async function removeSkillFromUser(tagid, userid){
  const body = {
    itemid: userid,
    tagid
  }
  try{
    await fetch(`${BASE_URL}/items`,{
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }catch(error) {
    console.log(error)
  }
  
}

export {
  createElement,
  addLoader,
  addErrorMessage,
  getTaskLogs,
  getTaskData,
  getUserData,
  getSelfDetails,
  getData,
  removeLoader,
  getUserSkills,
  getTagLevelOptions,
  addSkillToUser,
  removeSkillFromUser
};
