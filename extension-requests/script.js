const container = document.querySelector('.container');
const extensionRequestsContainer = document.querySelector(
  '.extension-requests',
);
const filterModal = document.getElementsByClassName(FILTER_MODAL)[0];
const filterButton = document.getElementById(FILTER_BUTTON);
const applyFilterButton = document.getElementById(APPLY_FILTER_BUTTON);
const clearButton = document.getElementById(CLEAR_BUTTON);
const sortButton = document.querySelector(SORT_BUTTON);
const ascIcon = document.getElementById(SORT_ASC_ICON);
const descIcon = document.getElementById(SORT_DESC_ICON);
const searchElement = document.getElementById(SEARCH_ELEMENT);
const params = new URLSearchParams(window.location.search);
const lastElementContainer = document.querySelector(LAST_ELEMENT_CONTAINER);
const renderLogRecord = {};
let extensionPageVersion = 0;
let nextLink = '';
let isDataLoading = false;
let userMap = new Map();
let userStatusMap = new Map();
const state = {
  currentExtensionRequest: null,
};
let currentUserDetails;
const filterStates = {};
let assigneeUsernamesList = [];
const isDev = params.get('dev') === 'true';

getSelfUser().then((response) => {
  currentUserDetails = response;
});

const updateUrl = () => {
  const states = { ...filterStates };
  states.assignee = assigneeUsernamesList;
  window.history.pushState({}, '', generateExtensionRequestParams(states));
};

const updateFilterStates = (key, value) => {
  filterStates[key] = value;
};

const getUser = async (username) => {
  username = username?.toLowerCase();
  if (userMap.has(username)) {
    return userMap.get(username);
  } else {
    const user = await getUserDetails(username);
    if (user) userMap.set(username, user);
    return user;
  }
};

const initializeUserMap = (userList) => {
  userList.forEach((user) => {
    userMap.set(user?.username?.toLowerCase(), {
      first_name: user.first_name,
      picture: { url: user.picture?.url },
      id: user.id,
      username: user.username,
    });
  });
};

const processUsernames = async (usernames) => {
  const validUsernameList = [];
  const userIdList = [];
  if (!usernames)
    return {
      validUsernameList,
      userIdList,
    };
  const usernameList = Array.isArray(usernames)
    ? usernames
    : usernames.split(',');
  const userPromise = [];
  for (const username of usernameList) {
    userPromise.push(getUser(username));
  }
  const userList = await Promise.all(userPromise);
  for (const user of userList) {
    if (user) {
      validUsernameList.push(user.username);
      userIdList.push(user.id);
    }
  }
  return { validUsernameList, userIdList };
};

const initializeUserStatusMap = (userStatusList) => {
  userStatusList.forEach((status) => {
    userStatusMap.set(status.userId, status);
  });
};

const updateUIBasedOnFilterStates = () => {
  const states = { ...filterStates };
  states.assignee = assigneeUsernamesList;
  if (states.assignee && states.assignee.length > 0) {
    searchElement.value = states.assignee.join(',');
  } else {
    searchElement.value = '';
  }

  if (states.order === 'asc') {
    descIcon.style.display = 'none';
    ascIcon.style.display = 'block';
  } else if (states.order === 'desc') {
    ascIcon.style.display = 'none';
    descIcon.style.display = 'block';
  }

  if (
    states.status &&
    Array.isArray(states.status) &&
    states.status.length > 0
  ) {
    states.status.forEach((state) => {
      toggleStatusCheckbox(state);
    });
  } else {
    toggleStatusCheckbox(states.status);
  }
};

const render = async () => {
  addTooltipToSortButton();
  if (window.location.search) {
    parseExtensionRequestParams(window.location.search, filterStates);
    const usersList = await processUsernames(filterStates.assignee);
    const userIdList = usersList.userIdList;
    assigneeUsernamesList = usersList.validUsernameList;
    const assigneeFilterState = userIdList.length ? userIdList : '';
    filterStates.assignee = assigneeFilterState;
    if (!filterStates.order) {
      filterStates.order = Order.DESCENDING;
    }
  } else {
    filterStates.status = Status.PENDING;
    filterStates.order = Order.DESCENDING;
    filterStates.size = DEFAULT_PAGE_SIZE;
  }
  updateUIBasedOnFilterStates();
  changeFilter();
  updateUrl();
  getInDiscordUserList().then((response) => {
    initializeUserMap(response.users);
  });
  getAllUsersStatus().then((response) => {
    initializeUserStatusMap(response.allUserStatus);
  });
  await populateExtensionRequests(filterStates);
  addIntersectionObserver();
};

const addIntersectionObserver = () => {
  intersectionObserver.observe(lastElementContainer);
};

const removeIntersectionObserver = () => {
  intersectionObserver.unobserve(lastElementContainer);
};

const changeFilter = () => {
  nextLink = '';
  extensionRequestsContainer.innerHTML = '';
};

const statusChange = () => {
  nextLink = '';
  extensionRequestsContainer.innerHTML = '';
  addIntersectionObserver();
};

const initializeAccordions = () => {
  let accordionList = document.querySelectorAll('.accordion.uninitialized');
  let i;
  for (i = 0; i < accordionList.length; i++) {
    accordionList[i].classList.remove('uninitialized');
    accordionList[i].addEventListener('click', function () {
      handleFormPropagation(event);
      this.classList.toggle('active');
      let panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        closeAllAccordions();
        updateAccordionHeight(panel);
      }
    });
  }
};

const updateAccordionHeight = (element) => {
  element.style.maxHeight = element.scrollHeight + 'px';
};

const closeAllAccordions = () => {
  let accordionsList = document.querySelectorAll('.accordion.active');
  for (let i = 0; i < accordionsList.length; i++) {
    let panel = accordionsList[i].nextElementSibling;
    if (panel.style.maxHeight) {
      accordionsList[i].classList.remove('active');
      panel.style.maxHeight = null;
    }
  }
};

const addTooltipToSortButton = () => {
  const sortToolTip = createElement({
    type: 'span',
    attributes: { class: 'tooltip sort-button-tooltip' },
    innerText: `Oldest first`,
  });
  sortButton.appendChild(sortToolTip);
};

const getExtensionColor = (deadline, createdTime) => {
  const wasDeadlineBreached = createdTime > deadline;
  if (wasDeadlineBreached) {
    return 'red-text';
  }
  const days = Math.floor((deadline - createdTime) / (1000 * 60 * 60 * 24));
  if (days > 3) {
    return 'green-text';
  }
  return 'orange-text';
};

const currentUserDetailsPromise = getSelfUser()
  .then((response) => {
    currentUserDetails = response;
  })
  .catch((error) => {
    currentUserDetails = null;
    if (isDev) {
      showToast(error?.message || "Couldn't fetch user details.", 'error');
    }
  });

async function populateExtensionRequests(query = {}, newLink) {
  if (query.dev && !currentUserDetails) {
    await currentUserDetailsPromise;
  }
  extensionPageVersion++;
  const currentVersion = extensionPageVersion;
  try {
    isDataLoading = true;
    addLoader(container);
    const extensionRequests = await getExtensionRequests(query, newLink);
    nextLink = extensionRequests.next;
    const allExtensionRequests = extensionRequests.allExtensionRequests;
    if (currentVersion !== extensionPageVersion) {
      return;
    }
    for (let data of allExtensionRequests) {
      if (query.dev) {
        createExtensionCard(data, true);
      } else {
        createExtensionCard(data);
      }
    }
    initializeAccordions();
  } catch (error) {
    addErrorElement(extensionRequestsContainer);
  } finally {
    if (currentVersion !== extensionPageVersion) return;
    removeLoader('loader');
    isDataLoading = false;
    if (extensionRequestsContainer.innerHTML === '') {
      addEmptyPageMessage(extensionRequestsContainer);
    }
  }
}

const intersectionObserver = new IntersectionObserver(async (entries) => {
  if (!nextLink) {
    return;
  }
  if (entries[0].isIntersecting && !isDataLoading) {
    if (isDev) {
      await populateExtensionRequests({ dev: true }, nextLink);
    } else {
      await populateExtensionRequests({}, nextLink);
    }
  }
});

function handleSuccess(element) {
  element.classList.add('green-card');
  setTimeout(() => element.classList.remove('green-card'), 1000);
}

function handleFailure(element) {
  element.classList.add('red-card');
  setTimeout(() => element.classList.remove('red-card'), 1000);
}

async function removeCard(element, elementClass) {
  element.classList.add(elementClass);
  await addDelay(800);
  element.style.overflow = 'hidden';
  element
    .animate(
      [
        {
          height: `${element.scrollHeight}px`,
          opacity: 1,
        },
        {
          height: `${Math.round(element.scrollHeight * 0.5)}px`,
          opacity: 0.2,
        },
        {
          height: `${Math.round(element.scrollHeight * 0.2)}px`,
          opacity: 0,
          margin: 0,
          padding: '1rem',
        },
        {
          height: 0,
          opacity: 0,
          margin: 0,
          padding: 0,
        },
      ],
      {
        duration: 800,
        easing: 'ease-out',
      },
    )
    .addEventListener('finish', () => {
      element.style.overflow = '';
      element.remove();
      if (extensionRequestsContainer.innerHTML === '') {
        addEmptyPageMessage(extensionRequestsContainer);
      }
    });
}

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

function populateStatus() {
  const statusList = [
    { name: 'Approved', id: 'APPROVED' },
    { name: 'Pending', id: 'PENDING' },
    { name: 'Denied', id: 'DENIED' },
  ];
  for (let i = 0; i < statusList.length; i++) {
    const { name, id } = statusList[i];
    addCheckbox(name, id, 'status-filter');
  }
}

function toggleStatusCheckbox(statusValue) {
  if (!statusValue) return;
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
  return Array.from(checkboxes).map((cb) => cb.value);
}

applyFilterButton.addEventListener('click', async () => {
  filterModal.classList.toggle('hidden');
  const checkedValuesStatus = getCheckedValues('status-filter');
  changeFilter();
  updateFilterStates('status', checkedValuesStatus);
  updateUrl();
  await populateExtensionRequests(filterStates);
});

clearButton.addEventListener('click', async function () {
  clearCheckboxes('status-filter');
  filterModal.classList.toggle('hidden');
  changeFilter();
  updateFilterStates('status', '');
  updateUrl();
  await populateExtensionRequests(filterStates);
});

filterModal.addEventListener('click', (event) => {
  event.stopPropagation();
});

window.onclick = function () {
  filterModal.classList.add('hidden');
};

searchElement.addEventListener('keypress', async (event) => {
  if (event.key === 'Enter') {
    const usernames = event.target.value.trim();
    let userIdList = [];
    if (usernames) {
      const usersList = await processUsernames(usernames);
      userIdList = usersList.userIdList;
      assigneeUsernamesList = usersList.validUsernameList;
      if (userIdList.length === 0) {
        searchElement.setCustomValidity('No users found!');
        searchElement.reportValidity();
        return;
      }
    } else {
      assigneeUsernamesList = [];
    }
    const assigneeFilterState = userIdList.length ? userIdList : '';
    updateFilterStates('assignee', assigneeFilterState);
    updateUrl();
    changeFilter();
    await populateExtensionRequests(filterStates);
  }
});

sortButton.addEventListener('click', async (event) => {
  toggleTooltipText();
  toggleSortIcon();
  toggleOrder();
  changeFilter();
  await populateExtensionRequests(filterStates);
});

const toggleTooltipText = () => {
  const tooltip = sortButton.querySelector('.tooltip');
  if (tooltip.textContent === OLDEST_FIRST) {
    tooltip.textContent = NEWEST_FIRST;
  } else {
    tooltip.textContent = OLDEST_FIRST;
  }
};

const toggleOrder = () => {
  if (filterStates.order === Order.DESCENDING) {
    updateFilterStates('order', Order.ASCENDING);
  } else {
    updateFilterStates('order', Order.DESCENDING);
  }
  updateUrl();
};

const toggleSortIcon = () => {
  if (ascIcon.style.display === 'none') {
    descIcon.style.display = 'none';
    ascIcon.style.display = 'block';
  } else {
    descIcon.style.display = 'block';
    ascIcon.style.display = 'none';
  }
};

filterButton.addEventListener('click', (event) => {
  event.stopPropagation();
  filterModal.classList.toggle('hidden');
});

populateStatus();

render();

const handleFormPropagation = async (event) => {
  event.preventDefault();
};

async function createExtensionCard(data, dev) {
  renderLogRecord[data.id] = [];
  //Create card element
  const rootElement = createElement({
    type: 'div',
    attributes: { class: 'extension-card' },
  });
  extensionRequestsContainer.appendChild(rootElement);
  let removeSpinner;
  if (!dev) {
    removeSpinner = addSpinner(rootElement);
    rootElement.classList.add('disabled');
  }

  //Api calls
  const userDataPromise = getUser(data.assignee);
  const taskDataPromise = getTaskDetails(data.taskId);
  const isDeadLineCrossed = Date.now() > secondsToMilliSeconds(data.oldEndsOn);
  const isNewDeadLineCrossed =
    Date.now() > secondsToMilliSeconds(data.newEndsOn);
  const isStatusPending = data.status === Status.PENDING;
  const requestedDaysTextColor = getExtensionColor(
    secondsToMilliSeconds(data.oldEndsOn),
    secondsToMilliSeconds(data.timestamp),
  );
  const extensionDays = dateDiff(
    secondsToMilliSeconds(data.newEndsOn),
    secondsToMilliSeconds(data.oldEndsOn),
  );
  const deadlineDays = dateDiff(
    Date.now(),
    secondsToMilliSeconds(data.oldEndsOn),
    (d) => d + (isDeadLineCrossed ? ' ago' : ''),
  );
  const newDeadlineDays = dateDiff(
    Date.now(),
    secondsToMilliSeconds(data.newEndsOn),
    (d) => d + (isNewDeadLineCrossed ? ' ago' : ''),
  );
  const requestedDaysAgo = dateDiff(
    Date.now(),
    secondsToMilliSeconds(data.timestamp),
    (s) => s + ' ago',
  );
  const formContainer = createElement({
    type: 'form',
    attributes: { class: 'extension-card-form' },
  });
  const titleText = createElement({
    type: 'span',
    attributes: { class: 'card-title title-text' },
    innerText: data.title,
  });
  const commitedHoursHoverTrigger = createElement({
    type: 'img',
    attributes: { class: 'commited-hours-trigger', src: '/images/time.svg' },
  });
  const extensionCardHeaderWrapper = createElement({
    type: 'div',
    attributes: { class: 'extension-request-header-wrapper' },
  });
  const titleInput = createElement({
    type: 'input',
    attributes: {
      class: 'title-text title-text-input hidden',
      id: 'title',
      name: 'title',
      value: data.title,
      'data-testid': 'title-text-input',
    },
  });
  const titleInputWrapper = createElement({
    type: 'div',
    attributes: { class: 'title-input-wrapper hidden' },
  });
  const titleInputError = createElement({
    type: 'div',
    attributes: {
      class: 'title-input-error hidden',
      'data-testid': 'title-input-error',
    },
    innerText: 'Title is required',
  });
  if (dev) {
    titleInputWrapper.appendChild(titleInput);
    titleInputWrapper.appendChild(titleInputError);
  }
  const commitedHoursHoverCard = createElement({
    type: 'div',
    attributes: { class: 'comitted-hours hidden' },
  });
  const CommitedHourslabel = createElement({
    type: 'span',
    attributes: { class: 'label' },
  });
  const CommitedHoursContent = createElement({
    type: 'span',
    attributes: { class: 'label-content' },
  });
  commitedHoursHoverTrigger.addEventListener('mouseenter', () => {
    commitedHoursHoverCard.classList.remove('hidden');
  });
  commitedHoursHoverTrigger.addEventListener('mouseleave', () => {
    setTimeout(() => {
      commitedHoursHoverCard.classList.add('hidden');
    }, 700);
  });
  commitedHoursHoverCard.appendChild(CommitedHourslabel);
  commitedHoursHoverCard.appendChild(CommitedHoursContent);
  if (dev) {
    extensionCardHeaderWrapper.appendChild(titleInputWrapper);
  } else {
    extensionCardHeaderWrapper.appendChild(titleInput);
  }
  extensionCardHeaderWrapper.appendChild(titleText);
  extensionCardHeaderWrapper.appendChild(commitedHoursHoverTrigger);
  extensionCardHeaderWrapper.appendChild(commitedHoursHoverCard);
  formContainer.appendChild(extensionCardHeaderWrapper);
  const summaryContainer = createElement({
    type: 'div',
    attributes: { class: 'summary-container' },
  });
  formContainer.appendChild(summaryContainer);
  const taskDetailsContainer = createElement({
    type: 'div',
    attributes: { class: 'task-details-container' },
  });
  summaryContainer.appendChild(taskDetailsContainer);
  const detailsContainer = createElement({
    type: 'div',
    attributes: { class: 'details-container' },
  });

  let statusSiteLink;
  if (dev) {
    statusSiteLink = createElement({
      type: 'a',
      attributes: {
        class: 'external-link skeleton-link',
        'data-testid': 'external-link skeleton-link',
      },
    });
  } else {
    statusSiteLink = createElement({
      type: 'a',
      attributes: {
        class: 'external-link',
      },
    });
  }
  const taskTitle = createElement({
    type: 'span',
    attributes: { class: 'task-title' },
    innerText: 'Task: ',
  });
  taskTitle.appendChild(statusSiteLink);
  taskDetailsContainer.appendChild(taskTitle);
  const detailsLine = createElement({
    type: 'span',
    attributes: { class: 'details-line' },
  });
  detailsContainer.appendChild(detailsLine);
  const deadlineContainer = createElement({
    type: 'div',
    attributes: { id: 'deadline-container' },
  });
  taskDetailsContainer.appendChild(deadlineContainer);
  const deadlineText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: `Deadline${isDeadLineCrossed ? ' ' : ' in '}`,
  });
  deadlineContainer.appendChild(deadlineText);

  const deadlineValue = createElement({
    type: 'span',
    innerText: `${deadlineDays}`,
    attributes: {
      class: `tooltip-container ${
        isDeadLineCrossed && isStatusPending ? 'red-text' : ''
      }`,
    },
  });

  deadlineContainer.appendChild(deadlineValue);
  const deadlineTooltip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: `${fullDateString(secondsToMilliSeconds(data.oldEndsOn))}`,
  });
  deadlineValue.appendChild(deadlineTooltip);
  const requestedContainer = createElement({
    type: 'div',
    attributes: { id: 'requested-time-container' },
  });
  taskDetailsContainer.appendChild(requestedContainer);
  const requestedText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Requested ',
  });
  requestedContainer.appendChild(requestedText);

  const requestedValue = createElement({
    type: 'span',
    attributes: {
      class: `requested-day tooltip-container ${requestedDaysTextColor}`,
    },
    innerText: ` ${requestedDaysAgo}`,
  });

  const requestedToolTip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: `${fullDateString(secondsToMilliSeconds(data.timestamp))}`,
  });
  requestedValue.appendChild(requestedToolTip);
  requestedContainer.appendChild(requestedValue);
  const taskStatusContainer = createElement({ type: 'div' });
  taskDetailsContainer.appendChild(taskStatusContainer);
  const taskStatusText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Task status ',
  });
  taskStatusContainer.appendChild(taskStatusText);

  let taskStatusValue;
  if (dev) {
    taskStatusValue = createElement({
      type: 'span',
      attributes: {
        class: 'skeleton-span',
        'data-testid': 'skeleton-span',
      },
    });
  } else {
    taskStatusValue = createElement({
      type: 'span',
    });
  }
  taskStatusContainer.appendChild(taskStatusValue);
  const datesContainer = createElement({
    type: 'div',
    attributes: { class: 'dates-container' },
  });
  summaryContainer.appendChild(datesContainer);
  const datesDetailsContainer = createElement({
    type: 'div',
    attributes: { class: 'details-container' },
  });
  datesContainer.appendChild(datesDetailsContainer);
  const extensionDetailsHeading = createElement({
    type: 'span',
    attributes: { class: 'details-heading' },
    innerText: 'Extension Details',
  });
  datesDetailsContainer.appendChild(extensionDetailsHeading);
  const extensionDetailsLine = createElement({
    type: 'span',
    attributes: { class: 'details-line' },
  });
  datesDetailsContainer.appendChild(extensionDetailsLine);
  const newDeadlineContainer = createElement({
    type: 'div',
    attributes: { id: 'new-deadline-container' },
  });
  datesContainer.appendChild(newDeadlineContainer);
  const newDeadlineText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: `New deadline${isNewDeadLineCrossed ? ' ' : ' in '}`,
  });
  newDeadlineContainer.appendChild(newDeadlineText);

  const newDeadlineValue = createElement({
    type: 'span',
    attributes: { class: 'requested-day tooltip-container' },
    innerText: ` ${newDeadlineDays}`,
  });

  const newDeadlineToolTip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: `${fullDateString(secondsToMilliSeconds(data.newEndsOn))}`,
  });
  newDeadlineValue.appendChild(newDeadlineToolTip);
  newDeadlineContainer.appendChild(newDeadlineValue);
  const extensionForContainer = createElement({
    type: 'div',
    attributes: { id: 'extension-container' },
  });
  datesContainer.appendChild(extensionForContainer);
  const extensionForText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Extend by ',
  });
  extensionForContainer.appendChild(extensionForText);

  const extensionForValue = createElement({
    type: 'span',
    attributes: { class: 'tooltip-container' },
    innerText: ` +${extensionDays}`,
  });

  const extensionToolTip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: fullDateString(secondsToMilliSeconds(data.newEndsOn)),
  });
  extensionForValue.appendChild(extensionToolTip);
  const extensionInput = createElement({
    type: 'input',
    attributes: {
      class: 'date-input hidden',
      type: 'date',
      name: 'newEndsOn',
      id: 'newEndsOn',
      oninput: 'this.blur()',
      value: dateString(secondsToMilliSeconds(data.newEndsOn)),
      'data-testid': 'extension-input',
    },
  });
  const extensionInputError = createElement({
    type: 'div',
    attributes: {
      class: 'extension-input-error hidden',
      'data-testid': 'extension-input-error',
    },
    innerText: "Past date can't be the new deadline",
  });
  newDeadlineContainer.appendChild(extensionInput);
  if (dev) {
    newDeadlineContainer.appendChild(extensionInputError);
  }
  extensionForContainer.appendChild(extensionForValue);

  const extensionRequestNumberContainer = createElement({ type: 'div' });
  datesContainer.appendChild(extensionRequestNumberContainer);

  const extensionRequestNumber = createElement({
    type: 'span',
    attributes: { class: 'card-row-text extension-request-number' },
    innerText: 'Request ',
  });
  extensionRequestNumberContainer.appendChild(extensionRequestNumber);

  const requestNumber = data.requestNumber || 1;

  const extensionRequestNumberValue = createElement({
    type: 'span',
    attributes: { class: 'extension-request-number' },
    innerText: `#${requestNumber}`,
  });

  extensionRequestNumberContainer.appendChild(extensionRequestNumberValue);
  const cardAssigneeButtonContainer = createElement({
    type: 'div',
    attributes: { class: 'card-assignee-button-container' },
  });
  const assigneeContainer = createElement({
    type: 'div',
    attributes: { class: 'assignee-container' },
  });
  cardAssigneeButtonContainer.appendChild(assigneeContainer);
  const assigneeText = createElement({
    type: 'span',
    attributes: { class: 'assignee-text' },
    innerText: 'Assigned to',
  });
  assigneeContainer.appendChild(assigneeText);
  let assigneeImage;
  if (dev) {
    assigneeImage = createElement({
      type: 'img',
      attributes: {
        class: 'assignee-image skeleton',
        'data-testid': 'assignee-image skeleton',
      },
    });
  } else {
    assigneeImage = createElement({
      type: 'img',
      attributes: { class: 'assignee-image' },
    });
  }
  assigneeContainer.appendChild(assigneeImage);

  let assigneeNameElement;
  if (dev) {
    assigneeNameElement = createElement({
      type: 'span',
      attributes: {
        class: 'assignee-name skeleton-text',
        'data-testid': 'assignee-name skeleton-text',
      },
    });
  } else {
    assigneeNameElement = createElement({
      type: 'span',
      attributes: { class: 'assignee-name' },
    });
  }
  assigneeContainer.appendChild(assigneeNameElement);

  const extensionCardButtons = createElement({
    type: 'div',
    attributes: { class: 'extension-card-buttons' },
  });
  cardAssigneeButtonContainer.appendChild(extensionCardButtons);
  //Conditionally render the buttons bases on status
  if (data.status === Status.APPROVED) {
    const approveButton = createElement({
      type: 'button',
      attributes: { class: 'approve-button approved' },
      innerText: Status.APPROVED,
    });
    extensionCardButtons.appendChild(approveButton);
  } else if (data.status === Status.DENIED) {
    const denyButton = createElement({
      type: 'button',
      attributes: { class: 'deny-button denied' },
      innerText: Status.DENIED,
    });
    extensionCardButtons.appendChild(denyButton);
  } else {
    const editButton = createElement({
      type: 'button',
      attributes: { class: 'edit-button', 'data-testid': 'edit-button' },
    });
    if (dev) {
      if (shouldDisplayEditButton(data.assigneeId, currentUserDetails)) {
        extensionCardButtons.appendChild(editButton);
      }
    } else {
      extensionCardButtons.appendChild(editButton);
    }
    const editIcon = createElement({
      type: 'img',
      attributes: { src: EDIT_ICON, alt: 'edit-icon' },
    });
    editButton.appendChild(editIcon);
    const updateWrapper = createElement({
      type: 'div',
      attributes: {
        class: 'update-wrapper hidden',
        'data-testid': 'update-wrapper',
      },
    });
    extensionCardButtons.appendChild(updateWrapper);
    const updateButton = createElement({
      type: 'button',
      attributes: { class: 'update-button', 'data-testid': 'update-button' },
      innerText: 'SAVE',
    });

    const cancelButton = createElement({
      type: 'button',
      attributes: { class: 'cancel-button' },
      innerText: 'CANCEL',
    });
    updateWrapper.appendChild(cancelButton);
    updateWrapper.appendChild(updateButton);

    const denyButton = createElement({
      type: 'button',
      attributes: { class: 'deny-button' },
    });

    const denyIcon = createElement({
      type: 'img',
      attributes: { src: CANCEL_ICON, alt: 'edit-icon' },
    });

    denyButton.appendChild(denyIcon);

    extensionCardButtons.appendChild(denyButton);

    const approveButton = createElement({
      type: 'button',
      attributes: { class: 'approve-button' },
    });
    const approveIcon = createElement({
      type: 'img',
      attributes: { class: 'check-icon', src: CHECK_ICON, alt: 'check-icon' },
    });
    approveButton.appendChild(approveIcon);
    extensionCardButtons.appendChild(approveButton);
    //Event listeners
    editButton.addEventListener('click', (event) => {
      handleFormPropagation(event);
      toggleInputs();
      toggleActionButtonVisibility();
      editButton.classList.toggle('hidden');
      updateWrapper.classList.toggle('hidden');
      if (!panel.style.maxHeight) {
        accordionButton.click();
      }
      updateAccordionHeight(panel);
    });
    updateButton.addEventListener('click', (event) => {
      if (dev) {
        const isTitleMissing = !titleInput.value;
        const isReasonMissing = !reasonInput.value;
        const todayDate = Math.floor(new Date().getTime() / 1000);
        const newDeadline = new Date(extensionInput.value).getTime() / 1000;
        const isDeadlineInPast = newDeadline < todayDate;
        const isInvalidDateFormat = isNaN(newDeadline);

        if (isInvalidDateFormat) {
          extensionInputError.innerText =
            'Invalid date format. Please provide a valid date.';
        } else if (isDeadlineInPast) {
          extensionInputError.innerText =
            "Past date can't be the new deadline.";
        }

        titleInputError.classList.toggle('hidden', !isTitleMissing);
        reasonInputError.classList.toggle('hidden', !isReasonMissing);
        extensionInputError.classList.toggle(
          'hidden',
          !(isDeadlineInPast || isInvalidDateFormat),
        );

        if (
          !isTitleMissing &&
          !isReasonMissing &&
          !(isDeadlineInPast || isInvalidDateFormat)
        ) {
          toggleInputs();
          toggleActionButtonVisibility();
          editButton.classList.toggle('hidden');
          updateWrapper.classList.toggle('hidden');
          titleInputWrapper.classList.add('hidden');
        }
      } else {
        toggleInputs();
        toggleActionButtonVisibility();
        editButton.classList.toggle('hidden');
        updateWrapper.classList.toggle('hidden');
      }
    });
    cancelButton.addEventListener('click', (event) => {
      titleInput.value = data.title;
      reasonInput.value = data.reason;
      extensionInput.value = dateString(secondsToMilliSeconds(data.newEndsOn));
      handleFormPropagation(event);
      toggleInputs();
      toggleActionButtonVisibility();
      editButton.classList.toggle('hidden');
      updateWrapper.classList.toggle('hidden');
      if (dev) {
        titleInputError.classList.add('hidden');
        reasonInputError.classList.add('hidden');
        extensionInputError.classList.add('hidden');
      }
    });
    const payloadForLog = {
      body: {},
      meta: {},
      timestamp: {
        _seconds: Date.now() / 1000,
      },
    };
    approveButton.addEventListener('click', (event) => {
      handleFormPropagation(event);
      const removeSpinner = addSpinner(rootElement);
      rootElement.classList.add('disabled');
      payloadForLog.body.status = Status.APPROVED;
      payloadForLog.meta = {
        extensionRequestId: data.id,
        name: `${currentUserDetails?.first_name} ${currentUserDetails?.last_name}`,
        userId: currentUserDetails?.id,
      };
      updateExtensionRequestStatus({
        id: data.id,
        body: { status: Status.APPROVED },
      })
        .then(async () => {
          removeSpinner();
          appendLogs(payloadForLog, data.id);
          await removeCard(rootElement, 'green-card');
        })
        .catch(() => {
          removeSpinner();
          handleFailure(rootElement);
        })
        .finally(() => {
          rootElement.classList.remove('disabled');
        });
    });
    approveButton.addEventListener('mouseenter', (event) => {
      approveIcon.src = CHECK_ICON_WHITE;
    });
    approveButton.addEventListener('mouseleave', (event) => {
      approveIcon.src = CHECK_ICON;
    });
    denyButton.addEventListener('click', (event) => {
      handleFormPropagation(event);
      const removeSpinner = addSpinner(rootElement);
      rootElement.classList.add('disabled');
      payloadForLog.body.status = Status.DENIED;
      payloadForLog.meta = {
        extensionRequestId: data.id,
        name: `${currentUserDetails?.first_name} ${currentUserDetails?.last_name}`,
        userId: currentUserDetails?.id,
      };
      updateExtensionRequestStatus({
        id: data.id,
        body: { status: Status.DENIED },
      })
        .then(async () => {
          removeSpinner();
          await removeCard(rootElement, 'red-card');
          appendLogs(payloadForLog, data.id);
        })
        .catch(() => {
          removeSpinner();
          handleFailure(rootElement);
        })
        .finally(() => {
          rootElement.classList.remove('disabled');
        });
    });
    denyButton.addEventListener('mouseenter', (event) => {
      denyIcon.src = CANCEL_ICON_WHITE;
    });
    denyButton.addEventListener('mouseleave', (event) => {
      denyIcon.src = CANCEL_ICON;
    });

    function toggleActionButtonVisibility() {
      if (approveButton.style.display === 'none') {
        approveButton.style.display = 'block';
      } else {
        approveButton.style.display = 'none';
      }

      if (denyButton.style.display === 'none') {
        denyButton.style.display = 'block';
      } else {
        denyButton.style.display = 'none';
      }
    }
  }
  const accordionButton = createElement({
    type: 'button',
    attributes: { class: 'accordion uninitialized' },
  });
  const accordionContainer = createElement({ type: 'div' });
  accordionContainer.appendChild(accordionButton);
  const downArrowIcon = createElement({
    type: 'img',
    attributes: { src: DOWN_ARROW_ICON, alt: 'down-arrow' },
  });
  accordionButton.appendChild(downArrowIcon);
  const panel = createElement({ type: 'div', attributes: { class: 'panel' } });
  accordionContainer.appendChild(panel);
  const reasonContainer = createElement({ type: 'div' });
  panel.appendChild(reasonContainer);
  const reasonTitle = createElement({
    type: 'span',
    attributes: { class: 'panel-title' },
    innerText: 'Reason',
  });
  reasonContainer.appendChild(reasonTitle);
  const reasonDetailsLine = createElement({
    type: 'span',
    attributes: { class: 'details-line' },
  });
  reasonContainer.appendChild(reasonDetailsLine);
  const reasonParagraph = createElement({
    type: 'p',
    attributes: { class: 'reason-text' },
    innerText: data.reason,
  });

  const reasonInput = createElement({
    type: 'textarea',
    attributes: {
      class: 'input-text-area hidden',
      id: 'reason',
      name: 'reason',
      'data-testid': 'reason-input-text-area',
    },
    innerText: data.reason,
  });
  const reasonInputError = createElement({
    type: 'span',
    attributes: {
      class: 'reason-input-error red-text hidden',
      'data-testid': 'reason-input-error',
    },
    innerText: 'Reason is required',
  });
  reasonContainer.appendChild(reasonInput);
  if (dev) {
    reasonContainer.appendChild(reasonInputError);
  }
  reasonContainer.appendChild(reasonParagraph);

  const renderExtensionCreatedLog = () => {
    const logContainer = document.getElementById(`log-container-${data.id}`);
    let creationLog = document.createElement('div');

    creationLog.classList.add('log-div');

    let logImg = document.createElement('img');
    logImg.classList.add('log-img');
    logImg.src = '/images/calendar-plus.png';

    let logText = document.createElement('p');
    logText.classList.add('reason-text');
    logText.innerText = `${
      assigneeNameElement.innerText
    } has created this extension request on ${fullDateString(
      secondsToMilliSeconds(data.timestamp),
    )}.`;

    creationLog.appendChild(logImg);
    creationLog.appendChild(logText);
    logContainer.appendChild(creationLog);
  };
  const logContainer = createElement({
    type: 'div',
    attributes: { id: `log-container-${data.id}` },
  });
  panel.appendChild(logContainer);

  const logDetailsLine = createElement({
    type: 'span',
    attributes: { class: 'log-details-line' },
    innerText: 'Logs',
  });
  logContainer.appendChild(logDetailsLine);

  const logDetailsLines = createElement({
    type: 'span',
    attributes: { class: 'details-line' },
  });
  logContainer.appendChild(logDetailsLines);

  accordionContainer.addEventListener('click', function () {
    renderLogs(data.id);
  });
  const cardFooter = createElement({ type: 'div' });
  cardFooter.appendChild(cardAssigneeButtonContainer);
  cardFooter.appendChild(accordionContainer);
  formContainer.appendChild(cardFooter);
  rootElement.appendChild(formContainer);
  formContainer.addEventListener('submit', async (e) => {
    e.preventDefault();
    let formData = formDataToObject(new FormData(e.target));
    formData['newEndsOn'] = new Date(formData['newEndsOn']).getTime() / 1000;
    if (dev) {
      const todayDate = Math.floor(new Date().getTime() / 1000);
      if (
        !formData.title ||
        !formData.reason ||
        isNaN(formData['newEndsOn']) ||
        formData['newEndsOn'] < todayDate
      ) {
        return;
      }
    }
    const removeSpinner = addSpinner(rootElement);
    rootElement.classList.add('disabled');
    const revertDataChange = updateCardData(formData);
    const payloadForLog = {
      body: {
        ...(formData?.newEndsOn !== data.newEndsOn && {
          newEndsOn: formData.newEndsOn,
          oldEndsOn: data.newEndsOn,
        }),
        ...(formData?.reason !== data.reason && {
          newReason: formData.reason,
          oldReason: data.reason,
        }),
        ...(formData?.title !== data.title && {
          newTitle: formData.title,
          oldTitle: data.title,
        }),
      },
      meta: {
        extensionRequestId: data.id,
        name: `${currentUserDetails?.first_name} ${currentUserDetails?.last_name}`,
        userId: currentUserDetails?.id,
      },
      timestamp: {
        _seconds: Date.now() / 1000,
      },
    };
    updateExtensionRequest({
      id: data.id,
      body: formData,
      underDevFeatureFlag: dev,
    })
      .then(() => {
        data.reason = formData.reason;
        data.tile = formData.title;
        data.newEndsOn = data.newEndsOn;
        handleSuccess(rootElement);
        if (dev) {
          const successMessage = 'Extension request successfully updated.';
          showToast(successMessage, 'success');
        }
        appendLogs(payloadForLog, data.id);
      })
      .catch((error) => {
        revertDataChange();
        handleFailure(rootElement);
        if (dev) {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            'An error occurred. Please try again.';
          showToast(errorMessage, 'error');
        }
      })
      .finally(() => {
        rootElement.classList.remove('disabled');
        updateAccordionHeight(panel);
        removeSpinner();
      });
  });

  function updateCardData(formData) {
    const previousTitle = titleText.innerText;
    const previousReason = reasonParagraph.innerText;
    const previousExtensionValue = extensionForValue.innerText;
    const previousNewDeadlineValue = newDeadlineValue.innerText;
    titleText.innerText = formData.title;
    reasonParagraph.innerText = formData.reason;
    const extDays = dateDiff(
      secondsToMilliSeconds(formData.newEndsOn),
      secondsToMilliSeconds(data.oldEndsOn),
    );
    extensionForValue.innerText = ` +${extDays}`;
    extensionToolTip.innerText = fullDateString(
      secondsToMilliSeconds(formData.newEndsOn),
    );
    extensionForValue.appendChild(extensionToolTip);
    const isNewDeadLineCrossed =
      Date.now() > secondsToMilliSeconds(formData.newEndsOn);
    const newDeadlineDays = dateDiff(
      Date.now(),
      secondsToMilliSeconds(formData.newEndsOn),
      (d) => d + (isNewDeadLineCrossed ? ' ago' : ''),
    );
    newDeadlineValue.innerText = newDeadlineDays;
    newDeadlineToolTip.innerText = fullDateString(
      secondsToMilliSeconds(formData.newEndsOn),
    );
    newDeadlineValue.appendChild(newDeadlineToolTip);
    function revertDataChange() {
      titleText.innerText = previousTitle;
      reasonParagraph.innerText = previousReason;
      extensionForValue.innerText = previousExtensionValue;
      newDeadlineValue.innerText = previousNewDeadlineValue;
    }
    return revertDataChange;
  }
  function toggleInputs() {
    if (dev) {
      titleInputWrapper.classList.toggle('hidden');
    }
    titleInput.classList.toggle('hidden');
    titleText.classList.toggle('hidden');
    reasonInput.classList.toggle('hidden');
    reasonParagraph.classList.toggle('hidden');
    newDeadlineValue.classList.toggle('hidden');
    extensionInput.classList.toggle('hidden');
  }

  async function renderLogs(extensionRequestId) {
    const logContainer = document.getElementById(
      `log-container-${extensionRequestId}`,
    );
    if (logContainer.querySelector('.server-log')?.innerHTML) {
      return;
    }
    const extensionLogs = await getExtensionRequestLogs({
      extensionRequestId,
    });
    const innerHTML = generateSentence(
      extensionLogs.logs,
      'server-log',
      extensionRequestId,
    );
    if (innerHTML) {
      const isLocalLogPresent = logContainer.querySelectorAll('.local-log');
      if (isLocalLogPresent) {
        const tempDiv = document.createElement('div');
        tempDiv.classList.add('invisible-div');
        tempDiv.innerHTML = innerHTML;

        const localLogElement = logContainer.querySelector('.local-log');
        logContainer.insertBefore(tempDiv, localLogElement);
      } else {
        logContainer.innerHTML += innerHTML;
      }
      updateAccordionHeight(panel);
    }
  }

  Promise.all([taskDataPromise, userDataPromise]).then((response) => {
    const [{ taskData }, userData] = response;
    const userImage = userData?.picture?.url ?? DEFAULT_AVATAR;
    let userFirstName = userData?.first_name ?? data.assignee;
    const taskStatus = taskData?.status?.replaceAll('_', ' ');
    const userId = userData?.id;
    const userStatus = userStatusMap.get(userId);
    const comittedHours = userStatus?.monthlyHours?.comitted;
    userFirstName = userFirstName ?? '';
    statusSiteLink.href = `${STATUS_BASE_URL}/tasks/${data.taskId}`;
    statusSiteLink.innerText = taskData.title;
    if (dev) {
      statusSiteLink.classList.remove('skeleton-link');
    }
    assigneeImage.src = userImage;
    if (dev) {
      assigneeImage.classList.remove('skeleton');
    }
    assigneeImage.alt = userFirstName;
    assigneeNameElement.innerText = userFirstName;
    if (dev) {
      assigneeNameElement.classList.remove('skeleton-text');
    }
    taskStatusValue.innerText = ` ${taskStatus}`;
    if (dev) {
      taskStatusValue.classList.remove('skeleton-span');
    }
    CommitedHourslabel.innerText = 'Commited Hours:';
    if (comittedHours) {
      CommitedHoursContent.innerText = `${comittedHours / 4} hrs / week`;
    } else {
      CommitedHoursContent.innerText = 'Missing';
      CommitedHoursContent.classList.add('label-content-missing');
    }

    if (!dev) {
      removeSpinner();
      renderExtensionCreatedLog();
      rootElement.classList.remove('disabled');
    }
  });
  return rootElement;

  function appendLogs(payload, extensionRequestId) {
    const logContainer = document.getElementById(
      `log-container-${extensionRequestId}`,
    );

    if (
      payload?.body?.status &&
      !logContainer.querySelector('.server-log')?.innerHTML
    ) {
      return;
    }
    const innerHTML = generateSentence(
      [payload],
      'local-log',
      extensionRequestId,
    );
    if (innerHTML) {
      logContainer.innerHTML += innerHTML;
    }
  }
}

function shouldDisplayEditButton(assigneeId, currentUserData) {
  return (
    currentUserData &&
    (assigneeId === currentUserData.id || currentUserData.roles.super_user)
  );
}

function showToast(message, type) {
  const existingToast = document.querySelector(
    '.extension-request-update-toast',
  );
  if (existingToast) {
    existingToast.remove();
  }
  const toast = document.createElement('div');
  toast.className = `extension-request-update-toast toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, UPDATE_TOAST_TIMING);
}

function generateSentence(response, parentClassName, id) {
  let arraySentence = [];
  let sentence = '';
  if (response && Array.isArray(response))
    response.forEach((log) => {
      if (log?.body?.status === 'APPROVED' || log?.body?.status === 'DENIED') {
        sentence = checkIfPreviouslyRendered(
          id,
          'REVIEW',
          log,
          parentClassName,
        );
        sentence && arraySentence.push(sentence);
      }
      if (!!log?.body?.newEndsOn && !!log?.body?.oldEndsOn) {
        sentence = checkIfPreviouslyRendered(id, 'ETA', log, parentClassName);
        sentence && arraySentence.push(sentence);
      }
      if (!!log?.body?.newReason && !!log?.body?.oldReason) {
        sentence = checkIfPreviouslyRendered(
          id,
          'REASON',
          log,
          parentClassName,
        );
        sentence && arraySentence.push(sentence);
      }
      if (!!log?.body?.newTitle && !!log?.body?.oldTitle) {
        sentence = checkIfPreviouslyRendered(id, 'TITLE', log, parentClassName);
        sentence && arraySentence.push(sentence);
      }
    });

  return arraySentence.reverse().join('');
}

function checkIfPreviouslyRendered(id, logType, log, parentClassName) {
  const alreadyRenderdLogs = renderLogRecord[id] || [];
  let sentence = '';
  let text = '';
  let name = 'You';
  if (parentClassName === 'server-log') {
    name = `${
      log?.meta?.userId === currentUserDetails?.id
        ? 'You'
        : log?.meta?.name || 'Super User'
    }`;
  }
  switch (logType) {
    case 'REVIEW': {
      const updationTime = dateDiff(
        Date.now(),
        secondsToMilliSeconds(log?.timestamp?._seconds),
      );
      text = `${name} ${log.body.status} this request ${updationTime} ago.`;

      sentence = `
      <div class="log-div ${parentClassName}">
        <img class="log-img" src="/images/${
          log?.body?.status === 'APPROVED' ? 'approved.png' : 'denied.png'
        }">
        </img>
        <p class="reason-text">${text}</p>
      </div>
      `;
      break;
    }
    case 'ETA': {
      text = `${name} changed the ETA from ${fullDateString(
        secondsToMilliSeconds(log.body.oldEndsOn),
      )} to ${fullDateString(secondsToMilliSeconds(log.body.newEndsOn))}.`;
      sentence = `
      <div class="log-div ${parentClassName}">
        <img class="log-img" src="/images/edit-icon.png"></img>
        <p class="reason-text">
        ${text}
        </p>
      </div>
      `;
      break;
    }
    case 'REASON': {
      text = `${name} changed the reason from ${log.body.oldReason} to ${log.body.newReason}.`;
      sentence = `
      <div class="log-div ${parentClassName}"> 
        <img class="log-img" src="/images/edit-icon.png"></img>
        <p class="reason-text">${text}</p>
      </div>
      `;
      break;
    }

    case 'TITLE': {
      text = `${name} changed the title from ${log.body.oldTitle} to ${log.body.newTitle}.`;
      sentence = `
      <div class="log-div ${parentClassName}"> 
        <img class="log-img" src="/images/edit-icon.png"></img>
        <p class="reason-text">
        ${text}
        </p>
      </div>`;
    }
  }
  if (alreadyRenderdLogs.includes(text)) {
    return '';
  }
  alreadyRenderdLogs.push(text);
  return sentence;
}
