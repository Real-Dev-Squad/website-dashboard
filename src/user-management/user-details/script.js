let userAllTasks = [];
let currentPageIndex = 1;
let taskPerPage = 1;
let totalPages = Math.ceil(userAllTasks.length / taskPerPage);

async function getUserData() {
  try {
    const res = await makeApiCall(`${API_BASE_URL}/users/${username}`);
    if (res.status === 200) {
      const data = await res.json();
      userDetailsContainer.classList.remove('hide');
      loader.classList.add('hide');
      generateUserData(data.user);
    }
  } catch (err) {
    const errorEl = document.createElement('p');
    errorEl.classList.add('error');
    errorEl.textContent = 'No Data Found';
    userDetailsContainer.appendChild(errorEl);
  }
}

async function getUserTasks() {
  try {
    const res = await makeApiCall(`${API_BASE_URL}/tasks/${username}`);
    if (res.status === 200) {
      const data = await res.json();
      userAllTasks = data.tasks;
      totalPages = Math.ceil(userAllTasks.length / taskPerPage);
      const loader = tasksList.querySelector('.loader');
      const mainContent = tasksList.querySelector('.main');
      loader.classList.add('hide');
      mainContent.classList.remove('hide');
      const tasks = getTasksToFetch(userAllTasks, currentPageIndex);
      generateUserTaskList(tasks);
    }
  } catch (err) {
    const errorEl = document.createElement('p');
    errorEl.classList.add('error');
    errorEl.textContent = 'No Data Found';
    tasksList.appendChild(errorEl);
  }
}

function generateUserData(userData) {
  const userImage = userDetailsContainer.querySelector('.user-details__image');
  const username = userDetailsContainer.querySelector(
    '.user-details__username',
  );
  const twitter = userDetailsContainer.querySelector('.social--twitter');
  const linkedin = userDetailsContainer.querySelector('.social--linkedin');
  const github = userDetailsContainer.querySelector('.social--github');
  const compony = userDetailsList.querySelector('.user-details__compony');
  const yoe = userDetailsList.querySelector('.user-details__yoe');

  const img = document.createElement('img');
  img.src = userData.img ? userData.img : defaultAvatar;
  img.setAttribute('alt', 'profile');
  userImage.appendChild(img);
  username.textContent = userData.username;
  compony.textContent = userData.compony;
  yoe.textContent = userData.yoe;
  twitter.setAttribute(
    'href',
    userData.twitter_id
      ? `https://twitter.com/${userData.twitter_id}`
      : `https://twitter.com/`,
  );
  linkedin.setAttribute(
    'href',
    userData.linkedin_id
      ? `https://www.linkedin.com/in/${userData.linkedin_id}`
      : `https://www.linkedin.com/in/`,
  );
  github.setAttribute(
    'href',
    userData.github_id
      ? `https://github.com/${userData.github_id}`
      : `https://github.com/`,
  );
}

function toggleListVisibility(e) {
  const listItems = userDetailsList.querySelectorAll('.visible-content');
  listItems.forEach((item) => {
    item.addEventListener('click', () => {
      const hiddenContent = item.nextElementSibling;
      const arrowIcon = item.querySelector('img');
      arrowIcon.classList.toggle('open');
      hiddenContent.classList.toggle('hide');
    });
  });
}

function getTasksToFetch(userTasks, currentIndex) {
  const startIndex = currentIndex * taskPerPage - taskPerPage;
  const endIndex = currentIndex * taskPerPage;
  return userTasks.filter(
    (_, index) => index >= startIndex && index < endIndex,
  );
}

function generateUserTaskList(userTasks) {
  userTasksContainer.innerHTML = '';
  if (!userTasks.length) {
    const errorEl = document.createElement('p');
    errorEl.classList.add('error');
    errorEl.textContent = 'No task Found';
    userTasksContainer.appendChild(errorEl);
  } else {
    userTasks.forEach((task) => {
      const userTask = document.createElement('div');
      userTask.classList.add('user-task');
      const title = document.createElement('h1');
      const description = document.createElement('p');
      const taskDetails = document.createElement('div');
      title.classList.add('task-title');
      description.classList.add('task-description');
      taskDetails.classList.add('task-details');

      const dueDate = document.createElement('div');
      dueDate.classList.add('hidden-details');
      const dueDateTitle = document.createElement('h3');
      dueDateTitle.textContent = 'Due Date';
      const dueDateValue = document.createElement('p');
      dueDateValue.textContent = task.endsOn;
      dueDate.appendChild(dueDateTitle);
      dueDate.appendChild(dueDateValue);

      const status = document.createElement('div');
      status.classList.add('hidden-details');
      const statusTitle = document.createElement('h3');
      statusTitle.textContent = 'Status';
      const statusValue = document.createElement('p');
      statusValue.textContent = task.status;
      status.appendChild(statusTitle);
      status.appendChild(statusValue);

      taskDetails.appendChild(dueDate);
      taskDetails.appendChild(status);
      title.textContent = task?.title;
      description.textContent = task?.purpose;
      userTask.appendChild(title);
      userTask.appendChild(description);
      userTask.appendChild(taskDetails);
      userTasksContainer.appendChild(userTask);
    });

    if (currentPageIndex === 1) {
      getPrevTaskButton.disabled = true;
    } else {
      getPrevTaskButton.disabled = false;
    }

    if (currentPageIndex === totalPages) {
      getNextTaskButton.disabled = true;
    } else {
      getNextTaskButton.disabled = false;
    }
  }
}

function fetchPrevTasks() {
  if (currentPageIndex > 1) {
    currentPageIndex--;
    const tasks = getTasksToFetch(userAllTasks, currentPageIndex);
    generateUserTaskList(tasks);
  }
}

function fetchNextTasks() {
  if (currentPageIndex < totalPages) {
    currentPageIndex++;
    const tasks = getTasksToFetch(userAllTasks, currentPageIndex);
    generateUserTaskList(tasks);
  }
}

getUserData();
getUserTasks();
toggleListVisibility();
getPrevTaskButton.addEventListener('click', fetchPrevTasks);
getNextTaskButton.addEventListener('click', fetchNextTasks);
