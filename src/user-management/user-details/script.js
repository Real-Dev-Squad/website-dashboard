let userData = {};
let userAllTasks = [];
let currentPageIndex = 1;
let taskPerPage = 3;
let totalPages = Math.ceil(userAllTasks.length / taskPerPage);

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
  showLoader('.user-details__personal');
  try {
    const res = await makeApiCall(`${API_BASE_URL}/users/${username}`);
    if (res.status === 200) {
      const data = await res.json();
      userData = data.user;
      hideLoader('.user-details__personal');
      generateUserData(data.user);
      removeElementClass(
        document.querySelector('.user-details__accordion'),
        'hide',
      );
    }
  } catch (err) {
    hideLoader('.user-details__personal');
    const errorEl = createElement({ type: 'p', classList: ['error'] });
    errorEl.appendChild(createTextNode('Something Went Wrong!'));
    const container = document.querySelector('.user-details__personal');
    container.appendChild(errorEl);
  }
}

function generateUserImage(alt) {
  const img = createElement({ type: 'img' });
  img.src = userData.img ? userData.img : defaultAvatar;
  img.setAttribute('alt', alt);
  return img;
}

function createSocialMediaAnchorNode({ href, id, alt, src }) {
  const a = createElement({ type: 'a', classList: ['social'] });
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
    classList: ['user-details__social'],
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
    classList: ['user-details__main'],
  });
  const header = createElement({
    type: 'div',
    classList: ['user-details__header'],
  });
  const username = createElement({
    type: 'h2',
    classList: ['user-details__username'],
  });
  username.appendChild(createTextNode(userData.username));

  const img = generateUserImage('profile');
  const socials = generateSocialMediaLinksList();
  header.append(img, username);
  main.append(header, socials);
  document.querySelector('.user-details__personal').appendChild(main);
  toggleAccordionTabsVisibility();
  generateAcademicTabDetails();
}

function toggleAccordionTabsVisibility() {
  const accordionTabs = document
    .querySelector('.user-details__accordion')
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
    classList: ['user-details__company'],
  });
  company.appendChild(createTextNode(userData.company));

  divOne.append(titleOne, company);

  const divTwo = createElement({ type: 'div', classList: ['hidden-details'] });
  const titleTwo = createElement({ type: 'h3' });
  titleTwo.appendChild(createTextNode('Current Year'));
  const yoe = createElement({
    type: 'p',
    classList: ['user-details__yoe'],
  });
  yoe.appendChild(createTextNode(userData.yoe));

  divTwo.append(titleTwo, yoe);
  div.append(divOne, divTwo);

  document.querySelector('.accordion__academic').appendChild(div);
}

function generateTasksTabDetails() {
  const div = createElement({
    type: 'div',
    classList: ['hidden-content', 'hide'],
  });
  const tasks = createElement({ type: 'div', classList: ['user-tasks'] });
  const pagination = createElement({ type: 'div', classList: ['pagination'] });
  const prevBtn = createElement({
    type: 'button',
    classList: ['pagination__prev-page'],
  });
  prevBtn.appendChild(createTextNode('Prev'));
  prevBtn.addEventListener('click', fetchPrevTasks);
  const nextBtn = createElement({
    type: 'button',
    classList: ['pagination__next-page'],
  });
  nextBtn.appendChild(createTextNode('Next'));
  nextBtn.addEventListener('click', fetchNextTasks);

  pagination.append(prevBtn, nextBtn);
  div.append(tasks, pagination);
  document.querySelector('.accordion__tasks').appendChild(div);
}

async function getUserTasks() {
  try {
    const res = await makeApiCall(`${API_BASE_URL}/tasks/${username}`);
    if (res.status === 200) {
      const data = await res.json();
      userAllTasks = data.tasks;
      totalPages = Math.ceil(userAllTasks.length / taskPerPage);
      const tasks = getTasksToFetch(userAllTasks, currentPageIndex);
      generateTasksTabDetails();
      generateUserTaskList(tasks);
    }
  } catch (err) {
    const div = createElement({
      type: 'div',
      classList: ['hidden-content', 'hide'],
    });
    const errorEl = createElement({ type: 'p', classList: ['error'] });
    errorEl.appendChild(createTextNode('Something Went Wrong!'));
    div.appendChild(errorEl);
    document.querySelector('.accordion__tasks').appendChild(div);
  }
}

function getTasksToFetch(userTasks, currentIndex) {
  const startIndex = currentIndex * taskPerPage - taskPerPage;
  const endIndex = currentIndex * taskPerPage;
  return userTasks.filter(
    (_, index) => index >= startIndex && index < endIndex,
  );
}

function generateUserTaskList(userTasks) {
  document.querySelector('.user-tasks').innerHTML = '';
  if (!userTasks.length) {
    const errorEl = createElement({ type: 'p', classList: ['error'] });
    errorEl.appendChild(createTextNode('No Data Found'));
    const container = document.querySelector(
      '.accordion__tasks > .hidden-content',
    );
    container.innerHTML = '';
    container.appendChild(errorEl);
  } else {
    userTasks.forEach((task) => {
      const taskCard = createSingleTaskCard(task);
      document.querySelector('.user-tasks').appendChild(taskCard);
    });

    if (currentPageIndex === 1) {
      document.querySelector('.pagination__prev-page').disabled = true;
    } else {
      document.querySelector('.pagination__prev-page').disabled = false;
    }

    if (currentPageIndex === totalPages) {
      document.querySelector('.pagination__next-page').disabled = true;
    } else {
      document.querySelector('.pagination__next-page').disabled = false;
    }
  }
}

function createSingleTaskCard(task) {
  const container = createElement({ type: 'div', classList: ['user-taks'] });
  const h2 = createElement({ type: 'h2', classList: ['task-title'] });
  h2.appendChild(createTextNode(task?.title));
  const p = createElement({ type: 'p', classList: ['task-description'] });
  p.appendChild(createTextNode(task?.purpose));
  const div = createElement({ type: 'div', classList: ['task-details'] });

  const dueDate = createElement({ type: 'div', classList: ['hidden-details'] });
  const dueDateTitle = createElement({ type: 'h3' });
  dueDateTitle.appendChild(createTextNode('Due Date'));
  const dueDateValue = createElement({ type: 'p' });
  dueDateValue.appendChild(createTextNode(task.endsOn));
  dueDate.append(dueDateTitle, dueDateValue);

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
