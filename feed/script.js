const container = document.querySelector('.container');
const activityFeedContainer = document.getElementById(ACITIVITY_FEED_CONTAINER);
const activityList = document.querySelector('.activity-list');
const tabsList = document.querySelector('.tabs');
const lastElementContainer = document.querySelector(LAST_ELEMENT_CONTAINER);

let query = {};
let newLink = '';
let activityFeedPage = 0;
let nextLink = '';
let isDataLoading = false;
let category = CATEGORY.ALL;

const tabsData = [
  { name: 'All', 'data-type': CATEGORY.ALL, class: 'active' },
  { name: 'Task Requests', 'data-type': CATEGORY.TASK_REQUESTS },
  { name: 'Extension Requests', 'data-type': CATEGORY.EXTENSION_REQUESTS },
  { name: 'Task', 'data-type': CATEGORY.TASK },
  { name: 'OOO Requests', 'data-type': CATEGORY.OOO },
];

async function renderFeed() {
  changeFilter();
  await populateActivityFeed({ category });
  addIntersectionObserver();
}

function createTabListItem(tab) {
  const listItem = document.createElement('li');
  listItem.textContent = tab.name;
  listItem.dataset.type = tab['data-type'];
  if (tab.class) {
    listItem.classList.add(tab.class);
  }
  return listItem;
}

function handleTabClick(tab) {
  tabs.forEach((t) => t.classList.remove('active'));
  tab.classList.add('active');
  currentCategory = tab.dataset.type;

  refreshFeed();
}

tabsData.forEach((tab) => {
  const listItem = createTabListItem(tab);
  listItem.addEventListener('click', function () {
    handleTabClick(this);
  });
  tabsList.appendChild(listItem);
});

// Select all tabs
const tabs = document.querySelectorAll('.tabs li');

const changeFilter = () => {
  nextLink = '';
  activityFeedContainer.innerHTML = '';
};

// Intersection Observer
const intersectionObserver = new IntersectionObserver(async (entries) => {
  if (!nextLink) {
    return;
  }
  if (entries[0].isIntersecting && !isDataLoading) {
    await populateActivityFeed({ category }, nextLink);
  }
});

const addIntersectionObserver = () => {
  intersectionObserver.observe(lastElementContainer);
};

function renderActivityItem(data) {
  const item = document.createElement('li');
  item.classList.add('activity-item');
  item.innerHTML = '';
  let content = '';
  switch (data.type) {
    case logType.EXTENSION_REQUESTS:
      content = formatExtensionRequestsLog(data);
      break;
    case logType.TASK:
      content = formatTasksLog(data);
      break;
    case logType.REQUEST_CREATED:
      content = formatOOORequests(data);
      break;
    case logType.TASK_REQUESTS:
      content = formatTaskRequestsLog(data);
      break;
    default:
      content = 'Unknown activity type';
  }
  item.innerHTML = `
    ${content}`;
  return item;
}

function formatOOORequests(data) {
  if (data.type !== logType.REQUEST_CREATED) return '';

  const user = data?.user || data?.createdBy;
  const from = formatDate(data.from);
  const until = formatDate(data.until);

  const containerDiv = document.createElement('div');
  containerDiv.classList.add('log-container');

  const titleDiv = document.createElement('a');
  titleDiv.classList.add('title');
  titleDiv.setAttribute('href', `/requests`);
  const imgIcon = document.createElement('img');
  imgIcon.setAttribute('src', 'assets/leave.webp');
  imgIcon.classList.add('img_icon');
  titleDiv.appendChild(imgIcon);

  const titleText = document.createElement('p');
  titleText.innerHTML = `<strong>${user}</strong> raised an OOO request from <strong>${from}</strong> until <strong>${until}</strong>`;
  titleDiv.appendChild(titleText);

  containerDiv.appendChild(titleDiv);

  if (data.message) {
    const reasonParagraph = document.createElement('p');
    reasonParagraph.innerHTML = `<strong>Reason:</strong> ${data.message}`;
    containerDiv.appendChild(reasonParagraph);
  }

  const timestampParagraph = document.createElement('p');
  timestampParagraph.classList.add('timestamp');
  timestampParagraph.textContent = formatDate(data.timestamp);
  containerDiv.appendChild(timestampParagraph);

  return containerDiv.outerHTML;
}

function createLogContainer(data, iconSrc, actionText) {
  const containerDiv = document.createElement('div');
  containerDiv.classList.add('log-container');

  const titleDiv = document.createElement('div');
  titleDiv.classList.add('title');

  const imgIcon = document.createElement('img');
  imgIcon.setAttribute('src', iconSrc);
  imgIcon.classList.add('img_icon');
  titleDiv.appendChild(imgIcon);

  const titleText = document.createElement('p');
  titleText.innerHTML = formatUserAction(data, actionText);
  titleDiv.appendChild(titleText);

  containerDiv.appendChild(titleDiv);

  const taskParagraph = document.createElement('p');
  taskParagraph.textContent = 'Task:- ';
  const taskLinkElement = document.createElement('a');
  taskLinkElement.setAttribute(
    'href',
    `${STATUS_BASE_URL}/tasks/${data?.taskId}`,
  );
  taskLinkElement.textContent = data.taskTitle || 'Untitled Task';
  taskParagraph.appendChild(taskLinkElement);
  containerDiv.appendChild(taskParagraph);

  const timestampParagraph = document.createElement('p');
  timestampParagraph.classList.add('timestamp');
  timestampParagraph.textContent = formatDate(data.timestamp);
  containerDiv.appendChild(timestampParagraph);

  return containerDiv.outerHTML;
}

function formatExtensionRequestsLog(data) {
  let actionText = '';
  if (!data.status) {
    actionText = describeChange(data);
  } else {
    switch (data.status) {
      case 'PENDING':
        actionText = 'raised an extension request for a task.';
        break;
      case 'APPROVED':
        actionText = 'approved an extension request for a task.';
        break;
      case 'DENIED':
        actionText = 'rejected an extension request for a task.';
        break;
      default:
        break;
    }
  }

  return createLogContainer(data, 'assets/extensionReq.webp', actionText);
}

function formatTasksLog(data) {
  let actionText = '';
  if (data.status) {
    actionText = `changed the status of the task to <strong>${data?.status}</strong>`;
  } else if (data.percentCompleted) {
    actionText = `updated the task progress to <strong>${data?.percentCompleted}%</strong>`;
  } else if (data.endsOn) {
    actionText = `updated the endsOn to <strong>${formatDate(
      data.endsOn,
    )}</strong>`;
  } else {
    actionText = `updated the task`;
  }

  return createLogContainer(data, 'assets/task.webp', actionText);
}

function createLogContainerForTaskRequests(
  data,
  iconSrc,
  actionText,
  additionalInfo = '',
) {
  const containerDiv = document.createElement('div');
  containerDiv.classList.add('log-container');

  const titleDiv = document.createElement('div');
  titleDiv.classList.add('title');

  const imgIcon = document.createElement('img');
  imgIcon.setAttribute('src', iconSrc);
  imgIcon.classList.add('img_icon');
  titleDiv.appendChild(imgIcon);

  const titleText = document.createElement('p');
  titleText.innerHTML = formatUserAction(data, actionText);
  titleDiv.appendChild(titleText);

  containerDiv.appendChild(titleDiv);

  if (additionalInfo) {
    const infoParagraph = document.createElement('div');
    infoParagraph.innerHTML = additionalInfo;
    containerDiv.appendChild(infoParagraph);
  }

  const timestampParagraph = document.createElement('p');
  timestampParagraph.classList.add('timestamp');
  timestampParagraph.textContent = formatDate(data.timestamp);
  containerDiv.appendChild(timestampParagraph);

  return containerDiv.outerHTML;
}

function formatTaskRequestsLog(data) {
  let actionText = '';
  switch (data.status) {
    case 'PENDING':
      actionText = 'raised a task request.';
      break;
    case 'APPROVED':
      actionText = 'approved a task request.';
      break;
    case 'DENIED':
      actionText = 'rejected a task request.';
      break;
    default:
      break;
  }

  const githubLink = data.externalIssueHtmlUrl
    ? formatLinkWithTitle(data.externalIssueHtmlUrl, 'Github Issue')
    : '';
  const proposedStartDate = formatDate(data.proposedStartDate / 1000);
  const proposedDeadline = formatDate(data.proposedDeadline / 1000);
  const taskLink = data.taskId
    ? formatLinkWithTitle(
        `${STATUS_BASE_URL}/tasks/${data?.taskId}`,
        data.taskTitle || 'Untitled Task',
      )
    : formatLinkWithTitle(
        `/task-requests/details/?id=${data?.taskRequestId}`,
        data.taskTitle || 'Untitled Task',
      );

  const additionalInfo = `
    <p> Proposed Start Date: ${proposedStartDate} </p>
    <p> Proposed Deadline: ${proposedDeadline} </p>
    ${githubLink}
    <p> ${data.taskId ? 'Task' : 'TCR'}: ${truncateWithEllipsis(taskLink)} </p>
  `;

  return createLogContainerForTaskRequests(
    data,
    'assets/taskRequests.webp',
    actionText,
    additionalInfo,
  );
}

async function populateActivityFeed(query = {}, newLink) {
  activityFeedPage++;
  const currentVersion = activityFeedPage;
  try {
    isDataLoading = true;
    addLoader(container);
    const activityFeedData = await getActivityFeedData(query, newLink);
    if (activityFeedData) {
      nextLink = activityFeedData.next;
      const allActivityFeedData = activityFeedData.data;
      if (currentVersion !== activityFeedPage) {
        return;
      }
      for (const data of allActivityFeedData) {
        const renderedItem = renderActivityItem(data);
        activityFeedContainer.appendChild(renderedItem);
      }
    }
  } catch (error) {
    showMessage(activityFeedContainer, error);
  } finally {
    if (currentVersion !== activityFeedPage) return;
    removeLoader('loader');
    isDataLoading = false;
  }
}

async function getActivityFeedData(query = {}, nextLink) {
  validateQuery(query);
  let finalUrl =
    API_BASE_URL + (nextLink || '/logs' + generateActivityFeedParams(query));
  const res = await fetch(finalUrl, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  try {
    const res = await fetch(finalUrl, {
      credentials: 'include',
    });

    const data = await res.json();
    if (res.ok) {
      return data;
    } else {
      switch (res.status) {
        case 401:
          return showMessage(
            activityFeedContainer,
            ERROR_MESSAGE.UNAUTHENTICATED,
          );
        case 403:
          return showMessage(activityFeedContainer, ERROR_MESSAGE.UNAUTHORIZED);
        case 404:
          return showMessage(
            activityFeedContainer,
            ERROR_MESSAGE.LOGS_NOT_FOUND,
          );
        case 400:
          showMessage(activityFeedContainer, data.message);
          return;
        default:
          break;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

let activeFilters = {
  username: null,
  startDate: null,
  endDate: null,
};

document.getElementById('apply-filter').addEventListener('click', applyFilter);
document.getElementById('clear-filter').addEventListener('click', clearFilters);

let currentCategory = CATEGORY.ALL;

function handleTabClick(tab) {
  tabs.forEach((t) => t.classList.remove('active'));
  tab.classList.add('active');
  currentCategory = tab.dataset.type;
  console.log('Updated currentCategory:', currentCategory);
  changeFilter();
  populateActivityFeed({ category: currentCategory });
}

function applyFilter() {
  const username = document.getElementById('assignee-search').value.trim();
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  activeFilters.username = username || null;
  activeFilters.startDate = startDate
    ? new Date(startDate).toISOString()
    : null;
  activeFilters.endDate = endDate ? new Date(endDate).toISOString() : null;

  refreshFeed();
}

function clearFilters() {
  document.getElementById('assignee-search').value = '';
  document.getElementById('start-date').value = '';
  document.getElementById('end-date').value = '';

  activeFilters = {};

  console.log('Cleared filters, activeFilters:', activeFilters);
  refreshFeed();
}

// main entry
renderFeed();
