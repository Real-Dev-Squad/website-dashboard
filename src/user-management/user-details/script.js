let userData = {};

async function getUserData() {
  try {
    const res = await makeApiCall(`${API_BASE_URL}/users/${username}`);
    if (res.status === 200) {
      const data = await res.json();
      userData = data.user;
      fillUserData(userData);
    }
  } catch (err) {
    console.error(err);
  }
}

async function getUserTasks() {
  try {
    const res = await makeApiCall(`${API_BASE_URL}/tasks/${username}`);
    if (res.status === 200) {
      const data = await res.json();
      generateUserTaskList(data.tasks);
    }
  } catch (err) {
    console.error(err);
  }
}

function fillUserData(userData) {
  const userImage = userDetailsContainer.querySelector('.user-details__image');
  const username = userDetailsContainer.querySelector(
    '.user-details__username',
  );
  const twitterSocial = userDetailsContainer.querySelector(
    '.socials-icon--twitter',
  );
  const linkedinSocial = userDetailsContainer.querySelector(
    '.socials-icon--linkedin',
  );
  const githubSocial = userDetailsContainer.querySelector(
    '.socials-icon--github',
  );
  twitterSocial.setAttribute(
    'href',
    `https://twitter.com/${userData.twitter_id}`,
  );
  linkedinSocial.setAttribute(
    'href',
    `https://www.linkedin.com/in/${userData.linkedin_id}`,
  );
  githubSocial.setAttribute('href', `https://github.com/${userData.github_id}`);
  userImage.src = userData.img ? userData.img : defaultAvatar;
  username.textContent = userData.username;
  userProfessionalDetails.textContent = userData?.compony;
  userDetailsYoe.textContent = userData?.yoe;
}

function toggleListVisibility(e) {
  const listItems = userDetailsList.querySelectorAll('li');
  listItems.forEach((item) => {
    item.addEventListener('click', () => {
      const hiddenContent = item.querySelector('.hidden-content');
      const arrowIcon = item.querySelector('img');
      arrowIcon.classList.toggle('open');
      hiddenContent.classList.toggle('hide');
    });
  });
}

function generateUserTaskList(userTasks) {
  if (!userTasks.length) {
    userTasksContainer.appendChild('No task Found');
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
  }
}

getUserData();
getUserTasks();
toggleListVisibility();
