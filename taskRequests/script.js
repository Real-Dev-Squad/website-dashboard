const API_BASE_URL = window.API_BASE_URL;
const taskRequestContainer = document.getElementById('task-request-container');
const containerBody = document.querySelector('.container__body');
const filterModal = document.getElementsByClassName(FILTER_MODAL)[0];
const applyFilterButton = document.getElementById(APPLY_FILTER_BUTTON);
const clearButton = document.getElementById(CLEAR_BUTTON);
const filterButton = document.getElementById(FILTER_BUTTON);
const sortModal = document.getElementsByClassName(SORT_MODAL)[0];
const containerFilter = document.querySelector(FILTER_CONTAINER);
const lastElementContainer = document.querySelector(LAST_ELEMENT_CONTAINER);
const sortButton = document.querySelector(SORT_BUTTON);
const backDrop = document.querySelector(BACKDROP);
const params = new URLSearchParams(window.location.search);
const isDev = params.get(DEV_FEATURE_FLAG) === 'true';
const loader = document.querySelector('.container__body__loader');
const startLoading = () => loader.classList.remove('hidden');
const stopLoading = () => loader.classList.add('hidden');
let pageVersion = 0;
let nextLink = '';
let isDataLoading = false;
let selectedSortButton = null;

const filterStates = {
  dev: true,
  status: Status.PENDING,
  order: CREATED_TIME,
  size: DEFAULT_PAGE_SIZE,
};

const updateFilterStates = (key, value) => {
  filterStates[key] = value;
};

async function getTaskRequests(query = {}, nextLink) {
  let finalUrl =
    API_BASE_URL + (nextLink || '/taskRequests' + getQueryParamsString(query));
  try {
    const res = await fetch(finalUrl, {
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      return data;
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
  taskRequestContainer.innerHTML = '';
  taskRequestContainer.appendChild(p);
}

function getAvatar(user) {
  if (user?.picture?.url) {
    return createCustomElement({
      tagName: 'img',
      src: user?.picture?.url,
    });
  }
  return createCustomElement({
    tagName: 'span',
    textContent: user?.first_name?.[0] || '?',
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
const changeFilter = () => {
  nextLink = '';
  taskRequestContainer.innerHTML = '';
};

sortButton.addEventListener('click', async (event) => {
  event.stopPropagation();
  sortModal.classList.toggle('hidden');
  backDrop.style.display = 'flex';
});

backDrop.addEventListener('click', () => {
  sortModal.classList.add('hidden');
  filterModal.classList.add('hidden');
  backDrop.style.display = 'none';
});

function toggleStatusCheckbox(statusValue) {
  const element = document.querySelector(
    `#status-filter input[value=${statusValue}]`,
  );
  element.checked = !element.checked;
}
function clearCheckboxes(groupName) {
  const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
  checkboxes.forEach((cb) => {
    cb.checked = false;
  });
}
function getCheckedValues(groupName) {
  const checkboxes = document.querySelectorAll(
    `input[name="${groupName}"]:checked`,
  );
  return Array.from(checkboxes).map((cb) => cb.value.toLowerCase());
}

filterButton.addEventListener('click', (event) => {
  filterModal.classList.toggle('hidden');
  backDrop.style.display = 'flex';
});

applyFilterButton.addEventListener('click', async () => {
  filterModal.classList.toggle('hidden');
  const checkedValuesStatus = getCheckedValues('status-filter');
  const checkedValuesRequestType = getCheckedValues('request-type-filter');
  changeFilter();
  if (checkedValuesStatus) {
    updateFilterStates('status', checkedValuesStatus);
  }
  if (checkedValuesRequestType) {
    updateFilterStates('requestType', checkedValuesRequestType);
  }
  await renderTaskRequestCards(filterStates);
});
clearButton.addEventListener('click', async function () {
  clearCheckboxes('status-filter');
  filterModal.classList.toggle('hidden');
  changeFilter();
  updateFilterStates('status', '');
  await renderTaskRequestCards(filterStates);
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
function addSortByIcon(name, id, groupName, order) {
  const group = document.getElementById(groupName);

  const containerAsc = createSortContainer(id, name, order);
  group.appendChild(containerAsc);
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

  function toggleSortModal() {
    sortModal.classList.toggle('hidden');
    backDrop.style.display = 'none';
  }

  function selectButton(button) {
    if (selectedSortButton === button) {
      selectedSortButton.classList.remove('selected');
      selectedSortButton = null;
      toggleSortModal();
    } else {
      if (selectedSortButton) {
        selectedSortButton.classList.remove('selected');
      }
      selectedSortButton = button;
      selectedSortButton.classList.add('selected');
      toggleSortModal();
    }
  }

  sortModalButtons.forEach((button) => {
    if (button) {
      button.addEventListener('click', async () => {
        selectButton(button);
        changeFilter();
        updateFilterStates('order', button.id);
        await renderTaskRequestCards(filterStates);
      });
    }
  });
  selectButton(createTimeAsc);
  toggleSortModal();
}

function createSortContainer(id, name, sortOrder) {
  const container = document.createElement('div');
  container.classList.add('sort-container', sortOrder);

  container.id = id;

  const nameSpan = document.createElement('span');
  nameSpan.classList.add('sort__button__text');
  nameSpan.textContent = name;
  const label = document.createElement('label');
  label.appendChild(nameSpan);

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
    { name: 'Assignment', id: 'assignment' },
    { name: 'Creation', id: 'creation' },
  ];

  statusList.map(({ name, id }) => addCheckbox(name, id, 'status-filter'));

  requestList.map(({ name, id }) =>
    addCheckbox(name, id, 'request-type-filter'),
  );

  const sortByList = [
    {
      name: 'Least Requested',
      id: 'REQUESTORS_COUNT_ASC',
      order: 'asc',
    },
    {
      name: 'Most Requested',
      id: 'REQUESTORS_COUNT_DESC',
      order: 'desc',
    },
    {
      name: 'Newest First',
      id: 'CREATED_TIME_DESC',
      order: 'desc',
    },
    {
      name: 'Oldest First',
      id: 'CREATED_TIME_ASC',
      order: 'asc',
    },
  ];

  sortByList.forEach(({ name, id, order }) =>
    addSortByIcon(name, id, 'sort_by-filter', order),
  );
}

populateStatus();
sortModalButtons();

function createTaskRequestCard(taskRequest) {
  let { id, task, status, taskTitle, users } = taskRequest;
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
              ...users.map((user, index) => {
                if (index < 3) {
                  return createCustomElement({
                    tagName: 'div',
                    class: 'taskRequest__card__footer__requestor__avatar',
                    title: user?.first_name,
                    child: [getAvatar(user)],
                  });
                }
              }),
              getRemainingCount(users) || '',
            ],
          }),
        ],
      }),
    ],
  });
  return card;
}

const intersectionObserver = new IntersectionObserver(async (entries) => {
  if (!nextLink) {
    return;
  }
  if (entries[0].isIntersecting && !isDataLoading) {
    await renderTaskRequestCards({}, nextLink);
  }
});

const addIntersectionObserver = () => {
  intersectionObserver.observe(lastElementContainer);
};
const removeIntersectionObserver = () => {
  intersectionObserver.unobserve(lastElementContainer);
};

async function renderTaskRequestCards(queries = {}, newLink = '') {
  pageVersion++;
  const currentVersion = pageVersion;
  try {
    isDataLoading = true;
    startLoading();
    const taskRequestResponse = await getTaskRequests(queries, newLink);
    const taskRequestsList = taskRequestResponse.data;
    nextLink = taskRequestResponse.next;
    if (currentVersion !== pageVersion) {
      return;
    }
    taskRequestsList.forEach((taskRequest) => {
      taskRequestContainer.appendChild(createTaskRequestCard(taskRequest));
    });
  } catch (error) {
    console.error(error);
    showMessage('ERROR', ErrorMessages.SERVER_ERROR);
  } finally {
    if (currentVersion !== pageVersion) return;
    stopLoading();
    isDataLoading = false;
    if (taskRequestContainer.innerHTML === '') {
      showMessage('INFO', 'No task requests found!');
    }
  }
}

async function render() {
  toggleStatusCheckbox(Status.PENDING.toUpperCase());

  await renderTaskRequestCards(filterStates);
  addIntersectionObserver();
}

render();
