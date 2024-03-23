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

const tabsData = [
  { name: 'All', 'data-type': CATEGORY.ALL, class: 'active' },
  { name: 'Task Requests', 'data-type': CATEGORY.TASK_REQUESTS },
  { name: 'Extension Requests', 'data-type': CATEGORY.EXTENSION_REQUESTS },
  { name: 'Task', 'data-type': CATEGORY.TASK },
  { name: 'OOO Requests', 'data-type': CATEGORY.OOO },
];

tabsData.forEach((tab) => {
  const listItem = document.createElement('li');
  listItem.textContent = tab.name;
  listItem.dataset.type = tab['data-type'];
  if (tab.class) {
    listItem.classList.add(tab.class);
  }
  tabsList.appendChild(listItem);
});

const tabs = document.querySelectorAll('.tabs li');

tabs.forEach((tab) => {
  tab.addEventListener('click', async function () {
    tabs.forEach((t) => t.classList.remove('active'));
    this.classList.add('active');
    const category = this.dataset.type;
    changeFilter();
    populateActivityFeed({ category });
  });
});

const changeFilter = () => {
  nextLink = '';
  activityFeedContainer.innerHTML = '';
};

async function renderFeed() {
  changeFilter();
  populateActivityFeed({ category: 'all' });
  addIntersectionObserver();
}

const intersectionObserver = new IntersectionObserver(async (entries) => {
  if (!nextLink) {
    return;
  }
  if (entries[0].isIntersecting && !isDataLoading) {
    await populateActivityFeed({}, nextLink);
  }
});

const addIntersectionObserver = () => {
  intersectionObserver.observe(lastElementContainer);
};

const removeIntersectionObserver = () => {
  intersectionObserver.unobserve(lastElementContainer);
};

// main entry
renderFeed();

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
    case logType.REQUEST_APPROVED:
    case logType.REQUEST_REJECTED:
      content = formatOOORequests(data);
      break;
    default:
      content = 'Unknown activity type';
  }
  item.innerHTML = `
    ${content}`;
  return item;
}

function formatOOORequests(data) {
  let text = '';
  if (data.type === logType.REQUEST_CREATED)
    text = `<p><strong>${
      data?.user || data?.createdBy
    }</strong> raised an OOO request from <strong>${new Date(
      data.from,
    ).toLocaleString()}</strong> until <strong>${new Date(
      data.until,
    ).toLocaleString()}</strong></p>`;
  if (data.status === 'APPROVED')
    text = `${
      data?.user || data?.createdBy
    } approved an extension request for task:`;
  if (data.status === 'DENIED')
    text = `${
      data?.user || data?.createdBy
    } rejected an extension request for task:`;

  return `<div>
            <div class="title">
              <img src="assets/leave.png" class="img_icon">
              <p class="">${text}</p>
           </div>
           ${data.message ? `<strong>Reason:</strong> ${data.message}` : ''}
           <p class="timestamp">
          ${new Date(data.timestamp * 1000)}
          </p>
       </div>`;
}

function formatExtensionRequestsLog(data) {
  let text = '';
  if (data.status === 'PENDING')
    text = `${
      data?.user || data?.createdBy
    } raised an extension request for task:`;
  if (data.status === 'APPROVED')
    text = `${
      data?.user || data?.createdBy
    } approved an extension request for task:`;
  if (data.status === 'DENIED')
    text = `${
      data?.user || data?.createdBy
    } rejected an extension request for task:`;
  return `<div>
            <div class="title">
              <img src="assets/extensionReq.png" class="img_icon">
              <p class="">${text}</p>
           </div>
           <p>
           Task:- 
          <a href=${STATUS_BASE_URL}/tasks/${data?.taskId}>${
    data.title || 'Untitled Task'
  }</a>
          </p>
          <p class="timestamp">
          ${new Date(data.timestamp * 1000)}
          </p>
       </div>`;
}

function formatTasksLog(data) {
  let text = '';
  if (data.status)
    text = `${
      data?.user || data?.createdBy
    } changed the status of the task to <strong>${data?.status}</strong>`;
  if (data.percentCompleted)
    text = text
      ? `${text} and changed the task progress to <strong>${data?.percentCompleted}%`
      : `${
          data?.user || data?.createdBy
        } updated the task progress to <strong>${data?.percentCompleted}%`;

  return `<div>
            <div class="title">
              <img src="assets/task.png" class="img_icon">
              <p class="">${text}</p>
            </div>
            <p> Task:- 
                <a href=${STATUS_BASE_URL}/tasks/${data?.taskId}>${
    data.title || 'Untitled Task'
  }</a>
           </p>
            <p class="timestamp">${new Date(data.timestamp * 1000)}</p>
       </div>`;
}

async function populateActivityFeed(query = {}, newLink) {
  activityFeedPage++;
  const currentVersion = activityFeedPage;
  try {
    isDataLoading = true;
    addLoader(container);
    const activityFeedData = await getActivityFeedData(query, newLink);
    nextLink = activityFeedData.next;
    const allActivityFeedData = activityFeedData.data;
    if (currentVersion !== activityFeedPage) {
      return;
    }
    for (const data of allActivityFeedData) {
      const renderedItem = renderActivityItem(data);
      activityFeedContainer.appendChild(renderedItem);
    }
  } catch (error) {
    addErrorElement(activityFeedContainer);
  } finally {
    if (currentVersion !== activityFeedPage) return;
    removeLoader('loader');
    isDataLoading = false;
    if (activityFeedContainer.innerHTML === '') {
      addEmptyPageMessage(activityFeedContainer);
    }
  }
}
