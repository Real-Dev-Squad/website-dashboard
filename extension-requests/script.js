const container = document.querySelector('.container');
const extensionRequestsContainer = document.querySelector(
  '.extension-requests',
);

const errorHeading = document.querySelector('h2#error');
const modalParent = document.querySelector('.extension-requests-modal-parent');
const closeModal = document.querySelectorAll('#close-modal');

//modal containers
const modalShowInfo = document.querySelector('.extension-requests-info');
const modalStatusForm = document.querySelector(
  '.extension-requests-status-form',
);
const modalUpdateForm = document.querySelector('.extension-requests-form');

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
let extensionPageVersion = 0;
let nextLink = '';
let isDataLoading = false;

let allCardsList;
let isFiltered = false;
if (params.get('dev') === 'true') {
  extensionRequestsContainer.classList.remove('extension-requests');
  extensionRequestsContainer.classList.add('extension-requests-new');
}

const state = {
  currentExtensionRequest: null,
};

const filterStates = {
  status: Status.PENDING,
  order: Order.ASCENDING,
  size: DEFAULT_PAGE_SIZE,
  dev: params.get('dev') === 'true',
};

const updateFilterStates = (key, value) => {
  filterStates[key] = value;
};

const render = async () => {
  addTooltipToSortButton();
  toggleStatusCheckbox(Status.PENDING);
  changeFilter();
  await populateExtensionRequests(filterStates);
  addIntersectionObserver();
};

const addIntersectionObserver = () => {
  if (params.get('dev') === 'true') {
    intersectionObserver.observe(lastElementContainer);
  }
};

const removeIntersectionObserver = () => {
  if (params.get('dev') === 'true') {
    intersectionObserver.unobserve(lastElementContainer);
  }
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

    allCardsList = [];

    if (params.get('dev') === 'true') {
      const extensionRequestPromiseList = [];
      for (let data of allExtensionRequests) {
        const extensionRequestCardPromise = createExtensionCard(data);
        extensionRequestPromiseList.push(extensionRequestCardPromise);
        allCardsList.push(data);
        extensionRequestCardPromise.then((extensionRequestCard) => {
          data['htmlElement'] = extensionRequestCard;
        });
      }
      initializeAccordions();
    } else {
      allExtensionRequests.forEach((data) => {
        const extensionRequestCard = createExtensionRequestCard(
          data,
          extensionRequestCardHeadings,
        );
        data['htmlElement'] = extensionRequestCard;
        allCardsList.push(data);
        extensionRequestsContainer.appendChild(extensionRequestCard);
      });
    }
  } catch (error) {
    errorHeading.textContent = ERROR_MESSAGE_RELOAD;
    errorHeading.classList.add('error-visible');
  } finally {
    if (currentVersion === extensionPageVersion) {
      removeLoader('loader');
      isDataLoading = false;
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
  element.classList.add('success-card');
  setTimeout(() => element.classList.remove('success-card'), 1000);
}

function handleFailure(element) {
  element.classList.add('failed-card');
  setTimeout(() => element.classList.remove('failed-card'), 1000);
}

function removeCard(element) {
  element.classList.add('success-card');
  element.classList.add('fade-out');
  setTimeout(() => element.remove(), 800);
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

const renderFilteredCards = (predicate) => {
  extensionRequestsContainer.innerHTML = '';
  let isEmpty = true;
  for (const card of allCardsList) {
    if (predicate(card)) {
      isEmpty = false;
      extensionRequestsContainer.append(card.htmlElement);
    }
  }

  if (isEmpty) {
    errorHeading.textContent = 'No Extension Requests found!';
    errorHeading.classList.add('error-visible');
  } else {
    errorHeading.innerHTML = '';
    errorHeading.classList.remove('error-visible');
  }
};
searchElement.addEventListener(
  'input',
  debounce((event) => {
    if (!event.target.value && isFiltered) {
      isFiltered = false;
      addIntersectionObserver();
      renderFilteredCards((c) => true);
      return;
    } else if (!event.target.value) {
      return;
    }

    removeIntersectionObserver();
    renderFilteredCards((card) => card?.assignee?.includes(event.target.value));
    isFiltered = true;
  }, 500),
);

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

const showTaskDetails = async (taskId, approved) => {
  if (!taskId) return;
  try {
    modalShowInfo.innerHTML = '<h3>Task Details</h3>';
    addLoader(modalShowInfo);
    const taskDetails = await getTaskDetails(taskId);
    const taskData = taskDetails.taskData;
    modalShowInfo.append(
      createTaskInfoModal(taskData, approved, taskInfoModelHeadings),
    );
  } catch (error) {
    errorHeading.textContent = 'Something went wrong';
    errorHeading.classList.add('error-visible');
    reload();
  } finally {
    removeLoader('loader');
  }
};
function createTaskInfoModal(data, approved, dataHeadings) {
  if (!data) return;

  const updateStatus = createElement({
    type: 'button',
    attributes: { class: 'status-form' },
    innerText: 'Update Status',
  });
  const closeModal = createElement({
    type: 'button',
    attributes: { id: 'close-modal' },
    innerText: 'Cancel',
  });
  updateStatus.addEventListener('click', () => {
    showModal('status-form');
    fillStatusForm();
  });
  closeModal.addEventListener('click', () => hideModal());

  const main = createTable(dataHeadings, data);

  if (!approved) main.appendChild(updateStatus);
  main.appendChild(closeModal);
  return main;
}
function createExtensionRequestCard(data, dataHeadings) {
  if (!data) return;

  const updateRequestBtn = createElement({
    type: 'button',
    attributes: { class: 'update_request' },
    innerText: 'Update Request',
  });
  const moreInfoBtn = createElement({
    type: 'button',
    attributes: { class: 'more' },
    innerText: 'More',
  });
  updateRequestBtn.addEventListener('click', () => {
    showModal('update-form');
    state.currentExtensionRequest = data;
    fillUpdateForm();
  });
  moreInfoBtn.addEventListener('click', () => {
    showModal('info');
    showTaskDetails(data.taskId, data.status === 'APPROVED');
    state.currentExtensionRequest = data;
  });

  const main = createTable(dataHeadings, data, 'extension-request');

  const wrapperDiv = createElement({ type: 'div' });

  wrapperDiv.appendChild(moreInfoBtn);
  wrapperDiv.appendChild(updateRequestBtn);

  main.appendChild(wrapperDiv);
  return main;
}

//PATCH requests functions
async function onStatusFormSubmit(e) {
  e.preventDefault();
  try {
    addLoader(container);
    let formData = formDataToObject(new FormData(e.target));
    await updateExtensionRequestStatus({
      id: state.currentExtensionRequest.id,
      body: formData,
    });
    reload();
  } catch (error) {
    errorHeading.textContent = 'Something went wrong';
    errorHeading.classList.add('error-visible');
    reload();
  } finally {
    removeLoader('loader');
  }
}
async function onUpdateFormSubmit(e) {
  e.preventDefault();
  try {
    addLoader(container);
    let formData = formDataToObject(new FormData(e.target));
    formData['newEndsOn'] = new Date(formData['newEndsOn']).getTime() / 1000;
    await updateExtensionRequest({
      id: state.currentExtensionRequest.id,
      body: formData,
    });
    reload();
  } catch (error) {
    errorHeading.textContent = 'Something went wrong';
    errorHeading.classList.add('error-visible');
    reload();
  } finally {
    removeLoader('loader');
  }
}

modalUpdateForm.addEventListener('submit', onUpdateFormSubmit);
modalStatusForm.addEventListener('submit', onStatusFormSubmit);

modalParent.addEventListener('click', hideModal);
closeModal.forEach((node) => node.addEventListener('click', () => hideModal()));

function showModal(show = 'form') {
  modalParent.classList.add('visible');
  modalParent.setAttribute('show', show);
}
function hideModal(e) {
  if (!e) {
    modalParent.classList.remove('visible');
    return;
  }
  e.stopPropagation();
  if (e.target === modalParent) {
    modalParent.classList.remove('visible');
  }
}
function reload() {
  setTimeout(() => window.history.go(0), 2000);
}
function fillStatusForm() {
  modalStatusForm.querySelector('.extensionId').value =
    state.currentExtensionRequest.id;
  modalStatusForm.querySelector('.extensionTitle').value =
    state.currentExtensionRequest.title;
  modalStatusForm.querySelector('.extensionAssignee').value =
    state.currentExtensionRequest.assignee;
}
function fillUpdateForm() {
  const { newEndsOn, oldEndsOn, status, id, title, assignee, reason } =
    state.currentExtensionRequest;

  modalUpdateForm.querySelector('.extensionNewEndsOn').value = new Date(
    newEndsOn * 1000,
  )
    .toISOString()
    .replace('Z', '');
  modalUpdateForm.querySelector('.extensionOldEndsOn').value = new Date(
    oldEndsOn * 1000,
  )
    .toISOString()
    .replace('Z', '');

  modalUpdateForm.querySelector('.extensionStatus').value = status;
  modalUpdateForm.querySelector('.extensionId').value = id;
  modalUpdateForm.querySelector('.extensionTitle').value = title;
  modalUpdateForm.querySelector('.extensionAssignee').value = assignee;
  modalUpdateForm.querySelector('.extensionReason').value = reason;
}
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
  //Create card element
  const rootElement = createElement({
    type: 'div',
    attributes: { class: 'extension-card' },
  });
  extensionRequestsContainer.appendChild(rootElement);

  const removeSpinner = addSpinner(rootElement);
  rootElement.classList.add('disabled');
  //Api calls
  const userDataPromise = getUserDetails(data.assignee);
  const taskDataPromise = getTaskDetails(data.taskId);

  const isDeadLineCrossed = Date.now() > secondsToMilliSeconds(data.oldEndsOn);

  const extensionDays = dateDiff(
    secondsToMilliSeconds(data.newEndsOn),
    secondsToMilliSeconds(data.oldEndsOn),
  );
  const deadlineDays = dateDiff(
    Date.now(),
    secondsToMilliSeconds(data.oldEndsOn),
    (d) => d + (isDeadLineCrossed ? ' ago' : ''),
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

  const titleInput = createElement({
    type: 'input',
    attributes: {
      class: 'title-text title-text-input hidden',
      id: 'title',
      name: 'title',
      value: data.title,
    },
  });

  formContainer.appendChild(titleInput);
  formContainer.appendChild(titleText);

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

  const deadlineContainer = createElement({ type: 'div' });
  taskDetailsContainer.appendChild(deadlineContainer);

  const deadlineText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: `Deadline${isDeadLineCrossed ? ': ' : ' in: '}`,
  });
  deadlineContainer.appendChild(deadlineText);

  const deadlineValue = createElement({
    type: 'span',
    innerText: `${deadlineDays}`,
    attributes: { class: 'tooltip-container' },
  });
  deadlineContainer.appendChild(deadlineValue);

  const deadlineTooltip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: `${fullDateString(secondsToMilliSeconds(data.oldEndsOn))}`,
  });

  deadlineValue.appendChild(deadlineTooltip);

  const taskStatusContainer = createElement({ type: 'div' });
  taskDetailsContainer.appendChild(taskStatusContainer);

  const taskStatusText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Task status:',
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

  const extensionForContainer = createElement({
    type: 'div',
  });
  datesContainer.appendChild(extensionForContainer);

  const extensionForText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Extension for:',
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
    innerText: `New Deadline: ${fullDateString(
      secondsToMilliSeconds(data.newEndsOn),
    )}`,
  });

  extensionForValue.appendChild(extensionToolTip);

  const extensionInput = createElement({
    type: 'input',
    attributes: {
      class: 'date-input hidden',
      type: 'datetime-local',
      name: 'newEndsOn',
      id: 'newEndsOn',
      value: dateTimeString(secondsToMilliSeconds(data.newEndsOn)),
    },
  });

  extensionForContainer.appendChild(extensionInput);
  extensionForContainer.appendChild(extensionForValue);
  const requestedContainer = createElement({
    type: 'div',
  });

  datesContainer.appendChild(requestedContainer);

  const requestedText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Requested:',
  });
  requestedContainer.appendChild(requestedText);

  const requestedValue = createElement({
    type: 'span',
    attributes: { class: 'requested-day tooltip-container' },
    innerText: ` ${requestedDaysAgo}`,
  });
  const requestedToolTip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: `${fullDateString(secondsToMilliSeconds(data.timestamp))}`,
  });

  requestedValue.appendChild(requestedToolTip);
  requestedContainer.appendChild(requestedValue);

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
      innerText: 'UPDATE',
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

      editButton.classList.toggle('hidden');
      updateWrapper.classList.toggle('hidden');
      if (!panel.style.maxHeight) {
        accordionButton.click();
      }
      updateAccordionHeight(panel);
    });

    updateButton.addEventListener('click', (event) => {
      toggleInputs();
      editButton.classList.toggle('hidden');
      updateWrapper.classList.toggle('hidden');
    });

    cancelButton.addEventListener('click', (event) => {
      handleFormPropagation(event);
      toggleInputs();
      editButton.classList.toggle('hidden');
      updateWrapper.classList.toggle('hidden');
    });

    approveButton.addEventListener('click', (event) => {
      handleFormPropagation(event);
      const removeSpinner = addSpinner(rootElement);
      rootElement.classList.add('disabled');
      updateExtensionRequestStatus({
        id: data.id,
        body: { status: Status.APPROVED },
      })
        .then(() => removeCard(rootElement))
        .catch(() => {
          handleFailure(rootElement);
        })
        .finally(() => {
          rootElement.classList.remove('disabled');
          removeSpinner();
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
      updateExtensionRequestStatus({
        id: data.id,
        body: { status: Status.DENIED },
      })
        .then(() => removeCard(rootElement))
        .catch(() => {
          handleFailure(rootElement);
        })
        .finally(() => {
          rootElement.classList.remove('disabled');
          removeSpinner();
        });
    });
    denyButton.addEventListener('mouseenter', (event) => {
      denyIcon.src = CANCEL_ICON_WHITE;
    });
    denyButton.addEventListener('mouseleave', (event) => {
      denyIcon.src = CANCEL_ICON;
    });
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
    updateAccordionHeight(panel);
    updateExtensionRequest({
      id: data.id,
      body: formData,
    })
      .then(() => {
        handleSuccess(rootElement);
      })
      .catch(() => {
        revertDataChange();
        handleFailure(rootElement);
      })
      .finally(() => {
        rootElement.classList.remove('disabled');
        removeSpinner();
      });
  });

  function updateCardData(formData) {
    const previousTitle = titleText.innerText;
    const previousReason = reasonParagraph.innerText;
    const previousExtensionValue = extensionForValue.innerText;

    titleText.innerText = formData.title;
    reasonParagraph.innerText = formData.reason;
    const extDays = dateDiff(
      secondsToMilliSeconds(formData.newEndsOn),
      secondsToMilliSeconds(data.oldEndsOn),
    );
    extensionForValue.innerText = ` +${extDays}`;

    function revertDataChange() {
      titleText.innerText = previousTitle;
      reasonParagraph.innerText = previousReason;
      extensionForValue.innerText = previousExtensionValue;
    }
    return revertDataChange;
  }

  function toggleInputs() {
    titleInput.classList.toggle('hidden');
    titleText.classList.toggle('hidden');

    reasonInput.classList.toggle('hidden');
    reasonParagraph.classList.toggle('hidden');

    extensionForValue.classList.toggle('hidden');
    extensionInput.classList.toggle('hidden');
  }

  Promise.all([taskDataPromise, userDataPromise]).then((response) => {
    const [{ taskData }, userData] = response;
    const userImage = userData?.picture?.url ?? DEFAULT_AVATAR;
    let userFirstName = userData?.first_name ?? data.assignee;
    const taskStatus = taskData?.status?.replaceAll('_', ' ');
    userFirstName = userFirstName ?? '';
    statusSiteLink.attributes.href = `${STATUS_BASE_URL}/tasks/${data.taskId}`;
    statusSiteLink.innerText = taskData.title;
    assigneeImage.src = userImage;
    assigneeImage.alt = userFirstName;
    assigneeNameElement.innerText = userFirstName;
    taskStatusValue.innerText = ` ${taskStatus}`;
    removeSpinner();
    rootElement.classList.remove('disabled');
  });

  return rootElement;
}
