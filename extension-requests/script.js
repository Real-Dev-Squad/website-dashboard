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
const filterStates = {
  status: Status.PENDING,
  order: Order.ASCENDING,
  size: DEFAULT_PAGE_SIZE,
};
const isDev = params.get('dev') === 'true';
getSelfUser().then((response) => {
  currentUserDetails = response;
});

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
    });
  });
};
const initializeUserStatusMap = (userStatusList) => {
  userStatusList.forEach((status) => {
    userStatusMap.set(status.userId, status);
  });
};
const render = async () => {
  addTooltipToSortButton();
  toggleStatusCheckbox(Status.PENDING);
  changeFilter();
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
async function populateExtensionRequests(query = {}, newLink) {
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
      createExtensionCard(data);
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
    await populateExtensionRequests({}, nextLink);
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
async function removeCard(element, style) {
  element.classList.add(style);
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
    });
  if (extensionRequestsContainer.innerHTML === '') {
    addEmptyPageMessage(extensionRequestsContainer);
  }
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
  await populateExtensionRequests(filterStates);
});
clearButton.addEventListener('click', async function () {
  clearCheckboxes('status-filter');
  filterModal.classList.toggle('hidden');
  changeFilter();
  updateFilterStates('status', '');
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
    if (usernames) {
      const usernameList = usernames.split(',');
      const userPromise = [];
      for (const username of usernameList) {
        userPromise.push(getUser(username));
      }
      const userList = await Promise.all(userPromise);
      const userIdList = [];
      for (const user of userList) {
        if (user) userIdList.push(user.id);
      }
      if (userIdList.length === 0) {
        searchElement.setCustomValidity('No users found!');
        searchElement.reportValidity();
        return;
      }
      updateFilterStates('assignee', userIdList);
      changeFilter();
      await populateExtensionRequests(filterStates);
    } else {
      updateFilterStates('assignee', '');
      changeFilter();
      await populateExtensionRequests(filterStates);
    }
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
async function createExtensionCard(data) {
  renderLogRecord[data.id] = [];
  //Create card element
  const rootElement = createElement({
    type: 'div',
    attributes: { class: 'extension-card' },
  });
  extensionRequestsContainer.appendChild(rootElement);
  const removeSpinner = addSpinner(rootElement);
  rootElement.classList.add('disabled');
  //Api calls
  const userDataPromise = getUser(data.assignee);
  const taskDataPromise = getTaskDetails(data.taskId);
  const isDeadLineCrossed = Date.now() > secondsToMilliSeconds(data.oldEndsOn);
  const isNewDeadLineCrossed =
    Date.now() > secondsToMilliSeconds(data.newEndsOn);
  const wasDeadlineBreached = data.timestamp > data.oldEndsOn;
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
    },
  });
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
  extensionCardHeaderWrapper.appendChild(titleInput);
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
  const statusSiteLink = createElement({
    type: 'a',
    attributes: {
      class: 'external-link',
    },
  });
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
      class: `tooltip-container ${isDeadLineCrossed ? 'red-text' : ''}`,
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
      class: `requested-day tooltip-container ${
        wasDeadlineBreached ? 'red-text' : ''
      }`,
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
  const taskStatusValue = createElement({
    type: 'span',
  });
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
    },
  });
  newDeadlineContainer.appendChild(extensionInput);
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
    innerText: `${requestNumber}`,
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
  const assigneeImage = createElement({
    type: 'img',
    attributes: { class: 'assignee-image' },
  });
  assigneeContainer.appendChild(assigneeImage);
  const assigneeNameElement = createElement({
    type: 'span',
    attributes: { class: 'assignee-name' },
  });
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
      attributes: { class: 'edit-button' },
    });
    extensionCardButtons.appendChild(editButton);
    const editIcon = createElement({
      type: 'img',
      attributes: { src: EDIT_ICON, alt: 'edit-icon' },
    });
    editButton.appendChild(editIcon);
    const updateWrapper = createElement({
      type: 'div',
      attributes: { class: 'update-wrapper hidden' },
    });
    extensionCardButtons.appendChild(updateWrapper);
    const updateButton = createElement({
      type: 'button',
      attributes: { class: 'update-button' },
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
      toggleInputs();
      toggleActionButtonVisibility();
      editButton.classList.toggle('hidden');
      updateWrapper.classList.toggle('hidden');
    });
    cancelButton.addEventListener('click', (event) => {
      // Resetting input fields
      titleInput.value = data.title;
      reasonInput.value = data.reason;
      extensionInput.value = dateString(secondsToMilliSeconds(data.newEndsOn));
      handleFormPropagation(event);
      toggleInputs();
      toggleActionButtonVisibility();
      editButton.classList.toggle('hidden');
      updateWrapper.classList.toggle('hidden');
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
        isDev,
        body: { status: Status.APPROVED },
      })
        .then(async () => {
          removeSpinner();
          if (isDev) {
            appendLogs(payloadForLog, data.id);
          }
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
        isDev,
        body: { status: Status.DENIED },
      })
        .then(async () => {
          removeSpinner();
          await removeCard(rootElement, 'red-card');
          if (isDev) {
            appendLogs(payloadForLog, data.id);
          }
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
    },
    innerText: data.reason,
  });
  reasonContainer.appendChild(reasonInput);
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
  // Adding log feature under dev flag
  if (isDev) {
    // Div for log container
    const logContainer = createElement({
      type: 'div',
      attributes: { id: `log-container-${data.id}` },
    });
    panel.appendChild(logContainer);

    // Creating title for container
    const logDetailsLine = createElement({
      type: 'span',
      attributes: { class: 'log-details-line' },
      innerText: 'Logs',
    });
    logContainer.appendChild(logDetailsLine);

    // Separation line
    const logDetailsLines = createElement({
      type: 'span',
      attributes: { class: 'details-line' },
    });
    logContainer.appendChild(logDetailsLines);

    accordionContainer.addEventListener('click', function () {
      renderLogs(data.id);
    });
  }
  const cardFooter = createElement({ type: 'div' });
  cardFooter.appendChild(cardAssigneeButtonContainer);
  cardFooter.appendChild(accordionContainer);
  formContainer.appendChild(cardFooter);
  rootElement.appendChild(formContainer);
  formContainer.addEventListener('submit', async (e) => {
    e.preventDefault();
    let formData = formDataToObject(new FormData(e.target));
    formData['newEndsOn'] = new Date(formData['newEndsOn']).getTime() / 1000;
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
      isDev,
      body: formData,
    })
      .then(() => {
        data.reason = formData.reason;
        data.tile = formData.title;
        data.newEndsOn = data.newEndsOn;
        handleSuccess(rootElement);
        if (isDev) {
          appendLogs(payloadForLog, data.id);
        }
      })
      .catch(() => {
        revertDataChange();
        handleFailure(rootElement);
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
      isDev: true,
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

        // Insert all the html before the first local-log
        const localLogElement = logContainer.querySelector('.local-log');
        logContainer.insertBefore(tempDiv, localLogElement);
      } else {
        logContainer.innerHTML += innerHTML;
      }
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
    assigneeImage.src = userImage;
    assigneeImage.alt = userFirstName;
    assigneeNameElement.innerText = userFirstName;
    taskStatusValue.innerText = ` ${taskStatus}`;
    CommitedHourslabel.innerText = 'Commited Hours:';
    if (comittedHours) {
      CommitedHoursContent.innerText = `${comittedHours / 4} hrs / week`;
    } else {
      CommitedHoursContent.innerText = 'Missing';
      CommitedHoursContent.classList.add('label-content-missing');
    }

    removeSpinner();
    if (isDev) renderExtensionCreatedLog();
    rootElement.classList.remove('disabled');
  });
  return rootElement;

  function appendLogs(payload, extensionRequestId) {
    const logContainer = document.getElementById(
      `log-container-${extensionRequestId}`,
    );

    // If logs has been previously rendered then only append logs
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
