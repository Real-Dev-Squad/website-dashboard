const params = new URLSearchParams(window.location.search);

let userData = {};
let userAllTasks = [];
let taskSearchQuery;
let allTasksFetched = false;
let isTaskFetching = false;
let userSkills = [];
let userAllPrs = [];
let userStatusData = {};
let currentPageIndex = 1;
let taskPerPage = 3;
let prsPerPage = 3;
let totalPrsPages = 0;
let totalPages = Math.ceil(userAllTasks.length / taskPerPage);
const username = new URLSearchParams(window.location.search).get('username');
const isDev = params.get('dev') === 'true';

function createElement({ type, classList = [] }) {
  const element = document.createElement(type);
  element.classList.add(...classList);
  return element;
}

function createTextNode(text) {
  return document.createTextNode(text);
}

function removeElementClass(element, className) {
  element.classList.remove(className);
}

function showLoader(selector) {
  const loader = createElement({ type: 'div', classList: ['loader'] });
  loader.appendChild(createTextNode('Loading...'));
  document.querySelector(selector).appendChild(loader);
}

function hideLoader(selector) {
  const container = document.querySelector(selector);
  if (container.hasChildNodes()) {
    container.firstElementChild.remove();
  }
}

async function getUserData() {
  showLoader('.user-details-header');
  try {
    const res = await makeApiCall(`${API_BASE_URL}/users/${username}`);
    if (res.status === 200) {
      const data = await res.json();
      userData = data.user;
      hideLoader('.user-details-header');
      generateUserData(data.user);
      removeElementClass(document.querySelector('.accordion'), 'hide');
    } else if (res.status === 404) {
      hideLoader('.user-details-header');
      generateNoDataFoundSection('User Not Found');
    }
  } catch (err) {
    console.log(err);
    hideLoader('.user-details-header');
    const errorEl = createElement({ type: 'p', classList: ['error'] });
    errorEl.appendChild(createTextNode('Something Went Wrong!'));
    const container = document.querySelector('.user-details-header');
    container.appendChild(errorEl);
  }
}

function generateUserImage(alt) {
  const img = createElement({ type: 'img' });
  img.src = userData.picture?.url ?? defaultAvatar;
  img.setAttribute('alt', alt);
  img.style.height = '100px';
  img.style.width = '100px';
  img.style.borderRadius = '50%';
  return img;
}

function createSocialMediaAnchorNode({ href, id, alt, src }) {
  const a = createElement({ type: 'a', classList: ['social', alt] });
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
  a.setAttribute('href', `${href}/${userData[id] ? userData[id] : ''}`);

  const p = createElement({ type: 'p' });
  p.appendChild(createTextNode(alt));

  const img = createElement({ type: 'img' });
  img.src = src;
  img.setAttribute('alt', alt);

  a.append(img, p);

  return a;
}

function generateSocialMediaLinksList() {
  const div = createElement({
    type: 'div',
    classList: ['user-details-social'],
  });

  socialMedia.forEach((item) => {
    const link = createSocialMediaAnchorNode({ ...iconMapper[item], id: item });
    div.appendChild(link);
  });

  return div;
}

function generateUserData(userData) {
  const main = createElement({
    type: 'div',
    classList: ['user-details-main'],
  });
  const socials = generateSocialMediaLinksList();

  if (userData?.profileURL) {
    checkUserIsSuperUser().then((isSuperUser) => {
      const FormPivotButton = createSocialMediaAnchorNode({
        href: `https://realdevsquad.com/intro.html?id=${userData.id}`,
        alt: 'Intro',
        src: isSuperUser ? './../images/info.svg' : './../images/lock-icon.svg',
      });

      if (!isSuperUser) {
        FormPivotButton.classList.add('disabled');
        FormPivotButton.addEventListener('click', (event) => {
          event.preventDefault();
        });

        FormPivotButton.addEventListener('mouseover', () => {
          const tooltip = createElement({
            type: 'span',
            classList: ['tooltip', 'colorstyle'],
          });
          tooltip.appendChild(
            createTextNode(
              'You do not have required permissions to view this.',
            ),
          );
          FormPivotButton.appendChild(tooltip);
        });
        FormPivotButton.addEventListener('mouseout', () => {
          const tooltip = FormPivotButton.querySelector('.tooltip');
          tooltip.remove();
        });
      }

      socials.appendChild(FormPivotButton);
    });
  }
  const wrapper = createElement({
    type: 'div',
    classList: ['user-details-wrap'],
  });
  const fullName = createElement({
    type: 'h2',
    classList: ['user-details-fullname'],
  });
  fullName.appendChild(
    createTextNode(userData.first_name + ' ' + userData.last_name),
  );

  const username = createElement({
    type: 'h3',
    classList: ['user-details-username'],
  });
  username.appendChild(createTextNode('@' + userData.username));

  const img = generateUserImage('profile');
  if (userData.roles?.in_discord) {
    const discordSocialButton = createSocialMediaAnchorNode({
      href: `https://discord.com/users/${userData.discordId}`,
      id: 'discord',
      alt: 'Discord',
      src: './../images/discord.svg',
    });
    socials.appendChild(discordSocialButton);
  }

  wrapper.append(img, fullName, username);
  main.append(wrapper, socials);
  document.querySelector('.user-details-header').appendChild(main);
}

function toggleAccordionTabsVisibility() {
  const accordionTabs = document
    .querySelector('.accordion')
    .querySelectorAll('.visible-content');
  accordionTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const hiddenContent = tab.nextElementSibling;
      const arrowIcon = tab.querySelector('img');
      if (hiddenContent) {
        arrowIcon.classList.toggle('open');
        hiddenContent.classList.toggle('hide');
      }
    });
  });
}

function generateAcademicTabDetails() {
  const div = createElement({
    type: 'div',
    classList: ['hidden-content', 'hide'],
  });
  const divOne = createElement({ type: 'div', classList: ['hidden-details'] });
  const titleOne = createElement({ type: 'h3' });
  titleOne.appendChild(createTextNode('College / Company'));
  const company = createElement({
    type: 'p',
    classList: ['user-details-company'],
  });
  company.appendChild(createTextNode(userData.company ?? MESSAGE_NOT_FOUND));

  divOne.append(titleOne, company);

  const divTwo = createElement({ type: 'div', classList: ['hidden-details'] });
  const titleTwo = createElement({ type: 'h3' });
  titleTwo.appendChild(createTextNode(MESSAGE_YEARS_OF_EXPERIENCE));
  const yoe = createElement({
    type: 'p',
    classList: ['user-details-yoe'],
  });
  yoe.appendChild(createTextNode(userData.yoe ?? MESSAGE_NOT_FOUND));

  divTwo.append(titleTwo, yoe);
  div.append(divOne, divTwo);

  document.querySelector('.accordion-academic').appendChild(div);
}

function generateTasksTabDetails() {
  const div = createElement({
    type: 'div',
    classList: ['hidden-content', 'hide'],
  });

  const tasks = createElement({
    type: 'div',
    classList: isDev ? ['user-tasks', 'user-tasks-dev'] : ['user-tasks'],
  });
  tasks.addEventListener('scroll', () => onScrollHandler(tasks));
  div.append(tasks);
  if (!isDev) {
    const pagination = createElement({
      type: 'div',
      classList: ['pagination'],
    });
    const prevBtn = createElement({
      type: 'button',
      classList: ['pagination-prev-page'],
    });
    prevBtn.appendChild(createTextNode('Prev'));
    prevBtn.addEventListener('click', fetchPrevTasks);
    const nextBtn = createElement({
      type: 'button',
      classList: ['pagination-next-page'],
    });
    nextBtn.appendChild(createTextNode('Next'));
    nextBtn.addEventListener('click', fetchNextTasks);

    pagination.append(prevBtn, nextBtn);
    div.append(tasks, pagination);
  }

  document.querySelector('.accordion-tasks').appendChild(div);
}

async function getUserTasks() {
  try {
    taskSearchQuery = isDev
      ? taskSearchQuery || `/tasks/?size=3&dev=true&assignee=${username}`
      : `/tasks/${username}`;

    //Flag to avoid multiple API calls with same payload
    if (!(isDev && isTaskFetching) && !allTasksFetched) {
      isTaskFetching = true;
      const res = await makeApiCall(`${API_BASE_URL}${taskSearchQuery}`);
      if (res.status === 200) {
        const data = await res.json();
        generateTasksTabDetails();
        if (isDev) {
          taskSearchQuery = data.next;
          if (data.next === '') {
            allTasksFetched = true;
          }
          generateUserTaskList(data.tasks);
        } else {
          userAllTasks = data.tasks;
          totalPages = Math.ceil(userAllTasks.length / taskPerPage);
          const tasks = getTasksToFetch(userAllTasks, currentPageIndex);
          generateUserTaskList(tasks);
        }
      }
      isTaskFetching = false;
    }
  } catch (err) {
    console.log({ err });
    const div = createElement({
      type: 'div',
      classList: ['hidden-content', 'hide'],
    });
    const errorEl = createElement({ type: 'p', classList: ['error'] });
    errorEl.appendChild(createTextNode('Something Went Wrong!'));
    div.appendChild(errorEl);
    document.querySelector('.accordion-tasks').appendChild(div);
    isTaskFetching = false;
  }
}

function getTasksToFetch(userTasks, currentIndex) {
  const startIndex = currentIndex * taskPerPage - taskPerPage;
  const endIndex = currentIndex * taskPerPage;
  return userTasks.filter(
    (_, index) => index >= startIndex && index < endIndex,
  );
}
function onScrollHandler(container) {
  if (container.scrollTop + container.clientHeight >= container.scrollHeight)
    getUserTasks();
}

function generateUserTaskList(userTasks) {
  if (isDev !== true) document.querySelector('.user-tasks').innerHTML = '';

  if (!userTasks.length) {
    const errorEl = createElement({ type: 'p', classList: ['error'] });
    errorEl.appendChild(createTextNode('No Data Found'));
    const container = document.querySelector(
      '.accordion-tasks > .hidden-content',
    );
    container.innerHTML = '';
    container.appendChild(errorEl);
  } else {
    userTasks.forEach((task) => {
      const taskCard = createSingleTaskCard(task);
      document.querySelector('.user-tasks').appendChild(taskCard);
    });

    if (!isDev) {
      if (currentPageIndex === 1) {
        document.querySelector('.pagination-prev-page').disabled = true;
      } else {
        document.querySelector('.pagination-prev-page').disabled = false;
      }

      if (currentPageIndex === totalPages) {
        document.querySelector('.pagination-next-page').disabled = true;
      } else {
        document.querySelector('.pagination-next-page').disabled = false;
      }
    }
  }
}

function createSingleTaskCard(task) {
  const container = createElement({ type: 'div', classList: ['user-task'] });
  const h2 = createElement({ type: 'h2', classList: ['task-title'] });
  h2.appendChild(createTextNode(task?.title));
  const p = createElement({ type: 'p', classList: ['task-description'] });

  if (task?.purpose == undefined) {
    p.appendChild(createTextNode('N/A'));
  } else {
    p.appendChild(createTextNode(task?.purpose));
  }

  const div = createElement({ type: 'div', classList: ['task-details'] });

  const dueDate = createElement({ type: 'div', classList: ['hidden-details'] });
  const dueDateTitle = createElement({ type: 'h3' });
  dueDateTitle.appendChild(createTextNode('Due Date'));
  const dueDateValue = createElement({
    type: 'p',
    classList: ['due-date-value'],
  }); // added class for testing purpose

  const daysToGo = generateDaysToGo(
    generateReadableDateFromSecondsTimeStamp(task.endsOn),
    task.status,
  );
  if (daysToGo.includes('Less Than a Day Remaining')) {
    // Wrap the text in a <span> with a yellow color style
    dueDateValue.innerHTML = `<span style="color: yellow;">${daysToGo}</span>`;
  } else {
    dueDateValue.appendChild(createTextNode(daysToGo));
  }

  dueDate.append(dueDateTitle, dueDateValue);

  //creating tooltip, gets displayed when we hover the element
  const toolTip = createElement({
    type: 'span',
    classList: ['task-due-date'],
  }); //creating a span for tooltip
  toolTip.appendChild(
    createTextNode(
      `Due Date: ${generateReadableDateFromSecondsTimeStamp(task.endsOn)}`,
    ),
  );

  dueDateValue.appendChild(toolTip); //appending it to the dueDateValue that we have create above
  dueDateValue.addEventListener('mouseover', (event) => {
    toolTip.style.visibility = 'visible';
  });
  dueDateValue.addEventListener('mouseout', (event) => {
    toolTip.style.visibility = 'hidden';
  });

  const status = createElement({ type: 'div', classList: ['hidden-details'] });
  const statusTitle = createElement({ type: 'h3' });
  statusTitle.appendChild(createTextNode('Status'));
  const statusValue = createElement({ type: 'p' });
  statusValue.appendChild(createTextNode(task.status));
  status.append(statusTitle, statusValue);

  div.append(dueDate, status);
  container.append(h2, p, div);
  return container;
}

function generateReadableDateFromSecondsTimeStamp(timeStamp) {
  //created function for readable date format
  return new Date(timeStamp * 1000).toDateString(); // new function because we are getting the value in seconds and not milliseconds
}

function generateDaysToGo(dateStr, status) {
  const inputDate = new Date(dateStr);

  const now = new Date();
  const offset = 330 * 60 * 1000;
  const currentDate = new Date(now.getTime() + offset);
  const diff = inputDate - currentDate; // Calculates the difference in milliseconds
  if (diff <= 0 && status == 'COMPLETED') {
    return 'Task has been completed within Committed timeline';
  } else if (diff <= 0) {
    return 'Deadline Passed'; // Due date is in the past
  } else if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
    return 'Less Than a Day Remaining'; // Less than a day remaining
  } else {
    const daysRemaining = Math.floor(diff / (24 * 60 * 60 * 1000)); // Calculate the days remaining
    return daysRemaining === 1
      ? '1 Day remaining'
      : daysRemaining + ' Days Remaining'; // Handle singular and plural for 1 day and more than 1 day
  }
}

function fetchPrevTasks() {
  if (currentPageIndex > 1) {
    currentPageIndex--;
    const tasks = getTasksToFetch(userAllTasks, currentPageIndex);
    generateUserTaskList(tasks);
  }
}

async function fetchNextTasks() {
  if (isDev) {
    await getUserTasks();
  } else if (currentPageIndex < totalPages) {
    currentPageIndex++;
    const tasks = getTasksToFetch(userAllTasks, currentPageIndex);
    generateUserTaskList(tasks);
  }
}

async function getUserSkills() {
  try {
    const res = await makeApiCall(
      `${API_BASE_URL}/users/${userData?.id}/skills`,
    );
    if (res.status === 200) {
      const data = await res.json();
      userSkills = data.skills;
      generateSkillsTabDetails(userSkills);
    }
  } catch (err) {
    console.error(err);
  }
}

function generateSkillsTabDetails(skills) {
  const div = createElement({
    type: 'div',
    classList: ['hidden-content', 'hide'],
  });

  if (skills.length) {
    skills.forEach((skill) => {
      const skillContainer = createElement({
        type: 'div',
        classList: ['skill-container', 'hidden-details'],
      });
      const skillName = createElement({ type: 'h3' });
      const skillLevel = createElement({
        type: 'span',
      });
      skillLevel.appendChild(createTextNode(`Level ${skill.levelValue}`));
      skillName.appendChild(createTextNode(`${skill.tagName}`));
      skillContainer.append(skillName, skillLevel);
      div.append(skillContainer);
    });
  } else {
    const errorEl = createElement({ type: 'p', classList: ['error'] });
    errorEl.appendChild(createTextNode('No Data Found'));
    div.innerHTML = '';
    div.appendChild(errorEl);
  }

  document.querySelector('.accordion-skills').append(div);
}

async function getUserAvailabilityStatus() {
  try {
    const res = await makeApiCall(
      `${API_BASE_URL}/users/status/${userData?.id}`,
    );
    if (res.status === 200) {
      const data = await res.json();
      userStatusData = data.data;
      generateAvalabilityTabDetails(userStatusData.currentStatus.state);
    } else {
      generateNoUserStatusFound();
    }
  } catch (err) {
    generateNoUserStatusFound();
    console.error(err);
  }
}

function generateAvalabilityTabDetails(state) {
  if (state === 'OOO') {
    generateUserOOODetails();
  } else if (state === 'IDLE') {
    generateUserIdleDetails();
  } else if (state === 'ACTIVE') {
    generateUserActiveDetails();
  } else {
    generateNoUserStatusFound();
  }
}

function getMonth(index) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[index];
}

function generateReadableDateFromTimeStamp(timeStamp) {
  return new Date(timeStamp).toDateString();
}

function getDiffrenceBetweenTimestamps(timestampOne, timestampTwo) {
  const diff = timestampOne - timestampTwo;
  const days = diff / 60 / 60 / 24;
  return Math.ceil(days).toFixed(0);
}

function calculateRemainingActiveMonthlyHours(totalHours) {
  const currentDate = new Date().getDate();
  const daysRemaining = 30 - currentDate;
  const hoursCommittedDaily = totalHours / 30;
  const remainingHours = daysRemaining * hoursCommittedDaily;
  return remainingHours.toFixed(1);
}

function generateUserActiveDetails() {
  const div = createElement({
    type: 'div',
    classList: ['hidden-content', 'hide'],
  });

  const divOne = createElement({ type: 'div', classList: ['hidden-details'] });
  const titleOne = createElement({ type: 'h3' });
  titleOne.appendChild(createTextNode('Current Status'));
  const currentStatus = createElement({
    type: 'p',
  });
  currentStatus.appendChild(
    createTextNode(`${userStatusData.currentStatus?.state}`),
  );
  divOne.append(titleOne, currentStatus);

  const divTwo = createElement({ type: 'div', classList: ['hidden-details'] });
  const titleTwo = createElement({ type: 'h3' });
  titleTwo.appendChild(createTextNode('From'));
  const activeFrom = createElement({ type: 'p' });
  activeFrom.appendChild(
    createTextNode(
      `${generateReadableDateFromTimeStamp(userStatusData.currentStatus.from)}`,
    ),
  );
  divTwo.append(titleTwo, activeFrom);
  div.append(divOne, divTwo);
  if (userStatusData.monthlyHours?.committed) {
    const divThree = createElement({
      type: 'div',
      classList: ['hidden-details'],
    });
    const titleThree = createElement({ type: 'h3' });
    titleThree.appendChild(
      createTextNode(
        `No of Hours alloted for ${getMonth(
          new Date().getMonth(),
        )} ${new Date().getFullYear()}`,
      ),
    );
    const hoursAlloted = createElement({ type: 'p' });
    hoursAlloted.appendChild(
      createTextNode(`${userStatusData.monthlyHours.committed} Hours`),
    );
    divThree.append(titleThree, hoursAlloted);

    const divFour = createElement({
      type: 'div',
      classList: ['hidden-details'],
    });
    const titleFour = createElement({
      type: 'h3',
      classList: ['hidden-details'],
    });
    titleFour.appendChild(createTextNode('Approx No of hours remaining'));
    const hoursRemaining = createElement({ type: 'p' });
    hoursRemaining.appendChild(
      createTextNode(
        `${calculateRemainingActiveMonthlyHours(
          userStatusData.monthlyHours.committed,
        )} Hours`,
      ),
    );
    divFour.append(titleFour, hoursRemaining);
    div.append(divThree, divFour);
  }

  document.querySelector('.accordion-availability').append(div);
}

function generateUserOOODetails() {
  const div = createElement({
    type: 'div',
    classList: ['hidden-content', 'hide'],
  });

  const divOne = createElement({ type: 'div', classList: ['hidden-details'] });
  const titleOne = createElement({ type: 'h3' });
  titleOne.appendChild(createTextNode('Current Status'));
  const currentStatus = createElement({
    type: 'p',
  });
  currentStatus.appendChild(
    createTextNode(`${userStatusData.currentStatus.state}`),
  );
  divOne.append(titleOne, currentStatus);

  const divTwo = createElement({ type: 'div', classList: ['hidden-details'] });
  const titleTwo = createElement({ type: 'h3' });
  titleTwo.appendChild(createTextNode('From'));
  const oooSince = createElement({ type: 'p' });
  oooSince.appendChild(
    createTextNode(
      `${generateReadableDateFromTimeStamp(userStatusData.currentStatus.from)}`,
    ),
  );
  divTwo.append(titleTwo, oooSince);

  const divThree = createElement({
    type: 'div',
    classList: ['hidden-details'],
  });
  const titleThree = createElement({
    type: 'h3',
  });
  titleThree.appendChild(createTextNode('Until'));
  const returnDate = createElement({ type: 'p' });
  returnDate.appendChild(
    createTextNode(
      `${generateReadableDateFromTimeStamp(
        userStatusData.currentStatus.until,
      )}`,
    ),
  );
  divThree.append(titleThree, returnDate);

  const divFour = createElement({
    type: 'div',
    classList: ['hidden-details'],
  });
  const titleFour = createElement({
    type: 'h3',
    classList: ['hidden-details'],
  });
  titleFour.appendChild(createTextNode('Reason'));
  const oooReason = createElement({ type: 'p' });
  oooReason.appendChild(
    createTextNode(`${userStatusData.currentStatus.message}`),
  );
  divFour.append(titleFour, oooReason);

  div.append(divOne, divTwo, divThree, divFour);

  document.querySelector('.accordion-availability').append(div);
}

function generateUserIdleDetails() {
  const div = createElement({
    type: 'div',
    classList: ['hidden-content', 'hide'],
  });

  const divOne = createElement({
    type: 'div',
    classList: ['hidden-details'],
  });
  const titleOne = createElement({ type: 'h3' });
  titleOne.appendChild(createTextNode('Current Status'));
  const currentStatus = createElement({
    type: 'p',
  });
  currentStatus.appendChild(
    createTextNode(`${userStatusData.currentStatus.state}`),
  );
  divOne.append(titleOne, currentStatus);

  const divTwo = createElement({
    type: 'div',
    classList: ['hidden-details'],
  });
  const titleTwo = createElement({ type: 'h3' });
  titleTwo.appendChild(createTextNode('From'));
  const idleFrom = createElement({
    type: 'p',
  });
  idleFrom.appendChild(
    createTextNode(
      `${generateReadableDateFromTimeStamp(userStatusData.currentStatus.from)}`,
    ),
  );
  divTwo.append(titleTwo, idleFrom);

  const divThree = createElement({
    type: 'div',
    classList: ['hidden-details'],
  });
  const titleThree = createElement({ type: 'h3' });
  titleThree.appendChild(createTextNode('Seeking to acquire skills in'));
  const skills = createElement({
    type: 'p',
  });
  skills.appendChild(createTextNode(userStatusData.currentStatus.message));
  divThree.append(titleThree, skills);

  div.append(divOne, divTwo, divThree);
  if (userStatusData.monthlyHours?.committed) {
    const divFour = createElement({
      type: 'div',
      classList: ['hidden-details'],
    });
    const titleFour = createElement({ type: 'h3' });
    titleFour.appendChild(
      createTextNode(
        `No of Hours alloted for ${getMonth(
          new Date().getMonth(),
        )} ${new Date().getFullYear()}`,
      ),
    );
    const hoursAlloted = createElement({ type: 'p' });
    hoursAlloted.appendChild(
      createTextNode(`${userStatusData.monthlyHours.committed} Hours`),
    );
    divFour.append(titleFour, hoursAlloted);

    const divFive = createElement({
      type: 'div',
      classList: ['hidden-details'],
    });
    const titleFive = createElement({
      type: 'h3',
      classList: ['hidden-details'],
    });
    titleFive.appendChild(createTextNode('Approx No of hours remaining'));
    const hoursRemaining = createElement({ type: 'p' });
    hoursRemaining.appendChild(
      createTextNode(
        `${calculateRemainingActiveMonthlyHours(
          userStatusData.monthlyHours.committed,
        )} Hours`,
      ),
    );
    divFive.append(titleFive, hoursRemaining);
    div.append(divFour, divFive);
  }

  document.querySelector('.accordion-availability').append(div);
}

function generateNoUserStatusFound() {
  const div = createElement({
    type: 'div',
    classList: ['hidden-content', 'hide'],
  });
  const errorEl = createElement({ type: 'p', classList: ['error'] });
  errorEl.appendChild(createTextNode('No Data Found'));
  div.innerHTML = '';
  div.appendChild(errorEl);
  document.querySelector('.accordion-availability').append(div);
}

function showContent() {
  const section1 = document.querySelector('.header');
  const section2 = document.querySelector('#main-section');
  const section3 = document.querySelector('footer');
  section1.classList.remove('hide');
  section2.classList.remove('hide');
  section3.classList.remove('hide');
}

function generateRemainingDays(dateStr) {
  const inputDate = new Date(dateStr);
  const now = new Date();
  const offset = 330 * 60 * 1000;
  const currentDate = new Date(now.getTime() + offset);
  const diff = currentDate - inputDate;
  if (diff >= 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (24 * 60 * 60 * 1000)) + ' days ago';
  } else if (diff >= 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 60 * 1000)) + ' hours ago';
  } else if (diff >= 60 * 1000) {
    return Math.floor(diff / (60 * 1000)) + ' minutes ago';
  } else {
    return Math.floor(diff / 1000) + ' seconds ago';
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('en-US', options);
}

function generatePrsTabDetails() {
  const accordionPrs = document.querySelector('.accordion-prs');
  const div = createElement({
    type: 'div',
    classList: ['hidden-content', 'hide'],
  });
  const prsSec = createElement({
    type: 'div',
    classList: ['user-pr'],
  });

  const pagination = createElement({ type: 'div', classList: ['pagination'] });
  const prevBtn = createElement({
    type: 'button',
    classList: ['pagination-prev-page', 'btn'],
  });
  prevBtn.appendChild(createTextNode('Prev'));
  prevBtn.addEventListener('click', () => {
    if (currentPageIndex <= 1) return;
    currentPageIndex--;
    generateUserPrsList(loadFetchedPrs(userAllPrs, currentPageIndex));
  });

  const nextBtn = createElement({
    type: 'button',
    classList: ['pagination-next-page'],
  });
  nextBtn.appendChild(createTextNode('Next'));
  nextBtn.addEventListener('click', () => {
    if (currentPageIndex >= totalPrsPages) return;
    currentPageIndex++;
    generateUserPrsList(loadFetchedPrs(userAllPrs, currentPageIndex));
  });
  pagination.append(prevBtn, nextBtn);
  div.append(prsSec, pagination);
  accordionPrs.appendChild(div);
}

async function getUserPrs() {
  try {
    const res = await makeApiCall(
      `${API_BASE_URL}/pullrequests/user/${username}`,
    );
    if (res.status === 200) {
      const data = await res.json();
      userAllPrs = data.pullRequests;
      totalPrsPages = Math.ceil(userAllPrs.length / prsPerPage);
      const prs = loadFetchedPrs(userAllPrs, currentPageIndex);
      generatePrsTabDetails();
      generateUserPrsList(prs);
    }
  } catch (err) {}
}

function loadFetchedPrs(userPr, currentIndex) {
  const startIndex = (currentIndex - 1) * prsPerPage;
  return userPr.slice(startIndex, startIndex + prsPerPage);
}

function noDataComponent() {
  const div = createElement({
    type: 'div',
    classList: ['hidden-content', 'hide'],
  });
  const errorEl = createElement({ type: 'p', classList: ['error'] });
  errorEl.appendChild(createTextNode('No Data Found'));
  div.innerHTML = '';
  div.appendChild(errorEl);
  document.querySelector('.accordion-prs').append(div);
}

function generateUserPrsList(userPrs) {
  document.querySelector('.user-pr').innerHTML = '';
  if (!userPrs.length) {
    noDataComponent();
  } else {
    userPrs.forEach((pr) => {
      const prsCard = createSinglePrCard(pr);
      document.querySelector('.user-pr').appendChild(prsCard);
    });
    if (!isDev) {
      document.querySelector('.pagination-next-page').disabled =
        currentPageIndex === totalPrsPages;
      document.querySelector('.pagination-prev-page').disabled =
        currentPageIndex === 1;
    }
  }
}

function createSinglePrCard(prs) {
  const userPr = createElement({ type: 'div', classList: ['user-pr'] });
  const h2 = createElement({ type: 'h2', classList: ['pr-title'] });
  h2.appendChild(createTextNode(prs.title.toString()));
  userPr.appendChild(h2);
  const table = createPrDetailsTable(prs);
  const viewButton = createPrViewButton(prs);
  userPr.append(table, viewButton);
  return userPr;
}

function createPrViewButton(prs) {
  const viewPRBtnDiv = createElement({
    type: 'div',
    classList: ['btn-wrapper'],
  });
  const viewPRBtn = createElement({
    type: 'button',
    classList: ['pr-view-btn'],
  });
  viewPRBtn.appendChild(createTextNode('View'));
  viewPRBtn.addEventListener('click', (e) => {
    window.open(prs.url, '_blank');
  });
  viewPRBtnDiv.appendChild(viewPRBtn);
  return viewPRBtnDiv;
}

function createPrDetailsTable(prs) {
  const container = createElement({
    type: 'table',
    classList: ['pr-details-table'],
  });
  const repoRow = createPrDetailsRow('Repository Name', prs.repository);
  container.appendChild(repoRow);
  const statusRow = createPrDetailsRow('Status', prs.state);
  container.appendChild(statusRow);
  const createdAtRow = createPrCreatedAt(
    'Created At',
    generateRemainingDays(prs.createdAt),
    prs,
  );
  container.appendChild(createdAtRow);
  const updatedAtRow = createPrUpdatedAt(
    'Updated At',
    generateRemainingDays(prs.updatedAt),
    prs,
  );
  container.appendChild(updatedAtRow);
  return container;
}

function createPrDetailsRow(head, data) {
  const row = createElement({ type: 'tr', classList: ['pr-details-row'] });
  const headElement = createElement({
    type: 'td',
    classList: ['pr-details-data'],
  });
  const headText = createElement({
    type: 'h4',
    classList: ['pr-details-head'],
  });
  headText.appendChild(createTextNode(head));
  headElement.appendChild(headText);
  const semiElement = createElement({ type: 'td', classList: ['colon'] });
  semiElement.appendChild(createTextNode(':'));
  const dataElement = createElement({
    type: 'td',
    classList: ['pr-details-data'],
  });
  dataElement.appendChild(createTextNode(data));
  row.append(headElement, semiElement, dataElement);
  return row;
}

function createHeadForPrDate(head) {
  const headElement = createElement({
    type: 'td',
    classList: ['pr-details-data'],
  });
  const headText = createElement({
    type: 'h4',
    classList: ['pr-details-head'],
  });
  headText.appendChild(createTextNode(head));
  headElement.appendChild(headText);
  const semiElement = createElement({ type: 'td', classList: ['colon'] });
  semiElement.appendChild(createTextNode(':'));
  return { headElement, semiElement };
}

function createPrCreatedAt(head, data, prs) {
  const row = createElement({ type: 'tr', classList: ['pr-details-row'] });
  const { headElement, semiElement } = createHeadForPrDate(head);
  const dataElement = createElement({
    type: 'td',
    classList: ['pr-details-data-created'],
  });
  dataElement.appendChild(createTextNode(data));
  const tooltip = createElement({ type: 'span', classList: ['tooltiptext'] });
  tooltip.appendChild(
    createTextNode(`Created on ${formatDate(prs.createdAt)}`),
  );
  dataElement.appendChild(tooltip);
  dataElement.addEventListener('mouseover', (e) => {
    tooltip.style.visibility = 'visible';
  });
  dataElement.addEventListener('mouseout', (e) => {
    tooltip.style.visibility = 'hidden';
  });
  row.append(headElement, semiElement, dataElement);
  return row;
}

function createPrUpdatedAt(head, data, prs) {
  const row = createElement({ type: 'tr', classList: ['pr-details-row'] });
  const { headElement, semiElement } = createHeadForPrDate(head);
  const dataElement = createElement({
    type: 'td',
    classList: ['pr-details-data-updated'],
  });
  dataElement.appendChild(createTextNode(data));
  const tooltip = createElement({ type: 'span', classList: ['tooltiptext'] });
  tooltip.appendChild(
    createTextNode(`Updated at ${formatDate(prs.updatedAt)}`),
  );
  dataElement.appendChild(tooltip);
  dataElement.addEventListener('mouseover', (e) => {
    tooltip.style.visibility = 'visible';
  });
  dataElement.addEventListener('mouseout', (e) => {
    tooltip.style.visibility = 'hidden';
  });
  row.append(headElement, semiElement, dataElement);
  return row;
}

function lockAccordiansForNonSuperUser() {
  const accordionTabs = document.querySelectorAll('.accordion');
  const arrowIconDiv = document.querySelectorAll('.icon-div');
  const accordionHeadings = document.querySelectorAll('.accordian-heading');
  arrowIconDiv.forEach((icon) => {
    icon.remove();
  });
  accordionHeadings.forEach((addIconDiv) => {
    const lockIconDiv = createElement({
      type: 'div',
      classList: ['lock-icon-div'],
    });
    addIconDiv.append(lockIconDiv);
  });
  const lockIconContainer = document.querySelectorAll('.lock-icon-div');
  lockIconContainer.forEach((addIcon) => {
    const lockIcon = createElement({
      type: 'img',
      classList: ['lock-icon-img'],
    });
    addIcon.append(lockIcon);
  });
  const lockIconImg = document.querySelectorAll('.lock-icon-img');
  lockIconImg.forEach((addAttributes) => {
    addAttributes.setAttribute('src', '/users/images/lock-icon.svg');
    addAttributes.setAttribute('alt', 'Lock Icon');
  });

  accordionTabs.forEach((tab) => {
    tab.classList.add('accordion-disabled');
  });
  lockIconContainer.forEach((tool) => {
    tool.addEventListener('mouseover', () => {
      const tooltip = createElement({ type: 'span', classList: ['tooltip'] });
      tooltip.appendChild(
        createTextNode('You do not have required permissions to view this.'),
      );
      tool.appendChild(tooltip);
    });
    tool.addEventListener('mouseout', () => {
      const tooltip = document.querySelector('.tooltip');
      tooltip.remove();
    });
  });
}

async function accessingUserData() {
  console.log('control is here');
  const isSuperUser = await checkUserIsSuperUser();
  if (isSuperUser) {
    getUserTasks();
    getUserPrs();
    getUserSkills();
    getUserAvailabilityStatus();
    generateAcademicTabDetails();
    toggleAccordionTabsVisibility();
  } else {
    lockAccordiansForNonSuperUser();
  }
}

showContent();
getUserData();
accessingUserData();
