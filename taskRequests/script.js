const API_BASE_URL = window.API_BASE_URL;
const taskRequestContainer = document.getElementById('task-request-container');
const containerBody = document.querySelector('.container__body');
const filterContainer = document.querySelector('.container__filters');
const filterModal = document.getElementsByClassName(FILTER_MODAL)[0];
const applyFilterButton = document.getElementById(APPLY_FILTER_BUTTON);
const filterButton = document.getElementById(FILTER_BUTTON);
const sortModal = document.getElementsByClassName(SORT_MODAL)[0];
const containerFilter = document.querySelector(FILTER_CONTAINER);
const oldContainerFilter = document.querySelector(OLD_FILTER);
const sortButton = document.querySelector(SORT_BUTTON);
const backDrop = document.querySelector(BACKDROP);
const params = new URLSearchParams(window.location.search);
const isDev = params.get(DEV_FEATURE_FLAG) === 'true';
const fetchedTaskRequests = [];

const loader = document.querySelector('.container__body__loader');
const startLoading = () => loader.classList.remove('hidden');
const stopLoading = () => loader.classList.add('hidden');
const params = new URLSearchParams(window.location.search);
async function getTaskRequests() {
  const endpoint = `/taskRequests${
    params.get('dev') === 'true' ? '?dev=true' : ''
  }`;
  startLoading();
  try {
    const res = await fetch(API_BASE_URL + endpoint, {
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      fetchedTaskRequests.push(...data.data);
      return;
    }

    if (res.status === 401) {
      showMessage('ERROR', ErrorMessages.UNAUTHENTICATED);
      return;
    }

    if (res.status === 403) {
      showMessage('ERROR', ErrorMessages.UNAUTHORIZED);
      return;
    }

    if (res.status === 404) {
      showMessage('ERROR', ErrorMessages.NOT_FOUND);
      return;
    }

    showMessage('ERROR', ErrorMessages.SERVER_ERROR);
  } catch (e) {
    console.error(e);
  } finally {
    stopLoading();
  }
}

function showMessage(type, message) {
  const p = document.createElement('p');
  const classes = ['taskRequest__message'];
  if (type === 'ERROR') {
    classes.push('taskRequest__message--error');
  }
  p.classList.add(...classes);
  p.textContent = message;
  containerBody.innerHTML = '';
  containerBody.appendChild(p);
}

function getAvatar(user) {
  if (user.user?.picture?.url) {
    return createCustomElement({
      tagName: 'img',
      src: user.user?.picture?.url,
    });
  }
  return createCustomElement({
    tagName: 'span',
    textContent: user?.user?.first_name[0] || '?',
  });
}
function getRemainingCount(requestors) {
  if (requestors.length > 3) {
    return createCustomElement({
      tagName: 'span',
      textContent: `+${requestors.length - 3}`,
    });
  }
}
function openTaskDetails(id) {
  const url = new URL(`/taskRequests/details`, window.location.href);

  url.searchParams.append('id', id);
  window.location.href = url;
}


if (isDev) {
  containerFilter.style.display = 'flex';
  oldContainerFilter.style.display = 'none';
} else {
  containerFilter.style.display = 'none';
  oldContainerFilter.style.display = 'flex';
}
sortButton.addEventListener('click', async (event) => {
  event.stopPropagation();
  sortModal.classList.toggle('hidden');
  backDrop.style.display = 'flex';
  sortModalButtons();
});

backDrop.addEventListener('click', () => {
  sortModal.classList.add('hidden');
  filterModal.classList.add('hidden');
  backDrop.style.display = 'none';
});

filterButton.addEventListener('click', (event) => {
  filterModal.classList.toggle('hidden');
  backDrop.style.display = 'flex';
});

function addCheckbox(labelText, value, groupName) {
  const group = document.getElementById(groupName);
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = groupName;
  checkbox.value = value;
  label.innerHTML = checkbox.outerHTML + '&nbsp;' + labelText;
  label.classList.add('checkbox-label');
  label.appendChild(document.createElement('br'));
  group.appendChild(label);
}
function addSortByIcon(name, id, groupName, iconPathAsc, iconPathDesc) {
  const group = document.getElementById(groupName);

  const containerAsc = createSortContainer(id, name, iconPathAsc, 'asc');
  group.appendChild(containerAsc);

  const containerDesc = createSortContainer(
    id + '-desc',
    name,
    iconPathDesc,
    'desc',
  );
  group.appendChild(containerDesc);
}

function sortModalButtons() {
  const assigneeAsc = document.getElementById(ASSIGNEE_COUNT);
  const assigneeDesc = document.getElementById(ASSIGNEE_DESC);
  const createTimeAsc = document.getElementById(CREATED_TIME);
  const createTimeDesc = document.getElementById(CREATED_TIME_DESC);

  const sortModalButtons = [
    assigneeAsc,
    assigneeDesc,
    createTimeAsc,
    createTimeDesc,
  ];
  let selectedButton = null;
  function toggleSortModal() {
    sortModal.classList.toggle('hidden');
    backDrop.style.display = 'none';
  }

  function selectButton(button) {
    if (selectedButton === button) {
      selectedButton.classList.remove('selected');
      selectedButton = null;
      toggleSortModal();
    } else {
      if (selectedButton) {
        selectedButton.classList.remove('selected');
      }
      selectedButton = button;
      selectedButton.classList.add('selected');
      toggleSortModal();
    }
  }

  sortModalButtons.forEach((button) => {
    if (button) {
      if (!button.hasEventListener) {
        button.hasEventListener = true;
        button.addEventListener('click', () => {
          selectButton(button);
        });
      }
    }
  });
}

function createSortContainer(id, name, iconPath, sortOrder) {
  const container = document.createElement('div');
  container.classList.add('sort-container', sortOrder);

  container.id = id;

  const nameSpan = document.createElement('span');
  nameSpan.textContent = name;
  const label = document.createElement('label');
  label.appendChild(nameSpan);

  const icon = document.createElement('img');
  icon.src = iconPath;
  icon.alt = name + ' ' + sortOrder + ' icon';
  icon.classList.add('sort-icon', sortOrder);

  label.appendChild(icon);
  label.classList.add('sort-label');

  container.appendChild(label);

  return container;
}

function populateStatus() {
  const statusList = [
    { name: 'Approved', id: 'APPROVED' },
    { name: 'Pending', id: 'PENDING' },
    { name: 'Denied', id: 'DENIED' },
  ];
  const requestList = [
    { name: 'Assignment', id: 'APPROVED' },
    { name: 'Creation', id: 'PENDING' },
  ];

  statusList.map(({ name, id }) => addCheckbox(name, id, 'status-filter'));

  requestList.map(({ name, id }) => addCheckbox(name, id, 'status-request'));

  const sortByList = [
    {
      name: 'Assignee Count',
      id: 'ASSIGNEE_COUNT',
      iconPathAsc: '/taskRequests/assets/sort-up.svg',
      iconPathDesc: '/taskRequests/assets/sort-down.svg',
    },
    {
      name: 'Created Time',
      id: 'CREATED_TIME',
      iconPathAsc: '/taskRequests/assets/sort-up.svg',
      iconPathDesc: '/taskRequests/assets/sort-down.svg',
    },
  ];

  sortByList.map(({ name, id, iconPathAsc, iconPathDesc }) =>
    addSortByIcon(name, id, 'sort_by-filter', iconPathAsc, iconPathDesc),
  );
}

populateStatus();

function createTaskRequestCard({ id, task, requestors, status, taskTitle }) {
  const card = createCustomElement({
    tagName: 'div',
    class: 'taskRequest__card',
    eventListeners: [{ event: 'click', func: (e) => openTaskDetails(id, e) }],
    child: [
      createCustomElement({
        tagName: 'div',
        class: 'taskRequest__card__header',
        child: [
          createCustomElement({
            tagName: 'h3',
            class: 'taskRequest__card__header__title',
            textContent: task?.title || taskTitle,
          }),
          createCustomElement({
            tagName: 'div',
            class: [
              'taskRequest__card__header__status',
              `taskRequest__card__header__status--${status.toLowerCase()}`,
            ],
            title: status.toLowerCase(),
          }),
        ],
      }),
      createCustomElement({
        tagName: 'div',
        class: 'taskRequest__card__body',
        child: [
          createCustomElement({
            tagName: 'p',
            textContent: task?.purpose,
          }),
        ],
      }),
      createCustomElement({
        tagName: 'div',
        class: 'taskRequest__card__footer',
        child: [
          createCustomElement({
            tagName: 'p',
            textContent: 'Requested By',
          }),
          createCustomElement({
            tagName: 'div',
            class: 'taskRequest__card__footer__requestor',
            child: [
              ...requestors.map((requestor, index) => {
                if (index < 3) {
                  return createCustomElement({
                    tagName: 'div',
                    class: 'taskRequest__card__footer__requestor__avatar',
                    title: requestor?.user?.first_name,
                    child: [getAvatar(requestor)],
                  });
                }
              }),
              getRemainingCount(requestors) || '',
            ],
          }),
        ],
      }),
    ],
  });
  return card;
}

function renderTaskRequestCards(taskRequests) {
  if (taskRequests.length > 0) {
    filterContainer.classList.remove('hidden');
    taskRequests.forEach((taskRequest) => {
      taskRequestContainer.appendChild(createTaskRequestCard(taskRequest));
    });
  }
}

(async () => {
  await getTaskRequests();
  renderTaskRequestCards(fetchedTaskRequests);
})();
