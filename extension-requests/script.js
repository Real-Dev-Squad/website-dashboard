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
const searchElement = document.getElementById(SEARCH_ELEMENT);
let allCardsList;
let isFiltered = false;

const state = {
  currentExtensionRequest: null,
};

const render = async () => {
  toggleStatusCheckbox(Status.PENDING);
  await populateExtensionRequests({ status: Status.PENDING });
  initializeAccordions();
};

const initializeAccordions = () => {
  let acc = document.getElementsByClassName('accordion');
  let i;

  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener('click', function () {
      this.classList.toggle('active');
      let panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        closeAllAccordions();
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  }
};
const closeAllAccordions = () => {
  let accordionsList = document.getElementsByClassName('accordion');
  for (let i = 0; i < accordionsList.length; i++) {
    let panel = accordionsList[i].nextElementSibling;
    if (panel.style.maxHeight) {
      accordionsList[i].classList.remove('active');
      panel.style.maxHeight = null;
    }
  }
};

async function populateExtensionRequests(query = {}) {
  try {
    addLoader(container);
    extensionRequestsContainer.innerHTML = '';
    const extensionRequests = await getExtensionRequests(query);
    const allExtensionRequests = extensionRequests.allExtensionRequests;

    allCardsList = [];
    const extensionRequestPromiseList = [];
    for (let data of allExtensionRequests) {
      const extensionRequestCardPromise = createExtensionCard(data);
      extensionRequestPromiseList.push(extensionRequestCardPromise);
      allCardsList.push(data);
      extensionRequestCardPromise.then((extensionRequestCard) => {
        data['htmlElement'] = extensionRequestCard;
      });
      // = createExtensionRequestCard(
      //   data,
      //   extensionRequestCardHeadings,
      // );
    }

    const extensionRequestCardList = await Promise.all(
      extensionRequestPromiseList,
    );

    for (let extensionRequestCard of extensionRequestCardList) {
      extensionRequestsContainer.appendChild(extensionRequestCard);
    }
  } catch (error) {
    errorHeading.textContent = 'Something went wrong, Please reload';
    errorHeading.classList.add('error-visible');
  } finally {
    removeLoader('loader');
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

  await populateExtensionRequests({ status: checkedValuesStatus });
});

clearButton.addEventListener('click', async function () {
  clearCheckboxes('status-filter');
  filterModal.classList.toggle('hidden');

  await populateExtensionRequests();
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
      renderFilteredCards((c) => true);
      return;
    } else if (!event.target.value) {
      return;
    }

    renderFilteredCards((card) => card.assignee.includes(event.target.value));
    isFiltered = true;
  }, 500),
);

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

async function createExtensionCard(data) {
  //Api calls
  const userDataPromise = getUserDetails(data.assignee);
  const taskDataPromise = getTaskDetails(data.taskId);

  const [{ taskData }, userData] = await Promise.all([
    taskDataPromise,
    userDataPromise,
  ]);

  const userImage = userData?.picture?.url ?? DEFAULT_AVATAR;
  const userFirstName = userData?.first_name ?? data.assignee;
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

  //Create card element
  const rootElement = createElement({
    type: 'div',
    attributes: { class: 'extension-card' },
  });

  const titleText = createElement({
    type: 'span',
    attributes: { class: 'title-text' },
    innerText: data.title,
  });
  rootElement.appendChild(titleText);

  const summaryContainer = createElement({
    type: 'div',
    attributes: { class: 'summary-container' },
  });
  rootElement.appendChild(summaryContainer);

  const taskDetailsContainer = createElement({
    type: 'div',
    attributes: { class: 'task-details-container' },
  });
  summaryContainer.appendChild(taskDetailsContainer);

  const detailsContainer = createElement({
    type: 'div',
    attributes: { class: 'details-container' },
  });
  taskDetailsContainer.appendChild(detailsContainer);

  const taskDetailsHeading = createElement({
    type: 'span',
    attributes: { class: 'details-heading' },
    innerText: 'Task Details',
  });
  detailsContainer.appendChild(taskDetailsHeading);

  const externalLink = createElement({
    type: 'a',
    attributes: { href: `${STATUS_BASE_URL}/tasks/${data.taskId}` },
  });
  detailsContainer.appendChild(externalLink);

  const externalLinkIcon = createElement({
    type: 'img',
    attributes: {
      height: '12px',
      src: EXTERNAL_LINK_ICON,
      alt: 'external-link-icon',
    },
  });
  externalLink.appendChild(externalLinkIcon);

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
  });
  deadlineContainer.appendChild(deadlineValue);

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
    innerText: ` ${taskData.status}`,
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

  const extensionForContainer = createElement({ type: 'div' });
  datesContainer.appendChild(extensionForContainer);

  const extensionForText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Extension for:',
  });
  extensionForContainer.appendChild(extensionForText);

  const extensionForValue = createElement({
    type: 'span',
    innerText: ` ${extensionDays}`,
  });
  extensionForContainer.appendChild(extensionForValue);

  const requestedContainer = createElement({ type: 'div' });
  datesContainer.appendChild(requestedContainer);

  const requestedText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Requested:',
  });
  requestedContainer.appendChild(requestedText);

  const requestedValue = createElement({
    type: 'span',
    innerText: ` ${requestedDaysAgo}`,
  });
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
    attributes: { src: userImage, alt: userFirstName, class: 'assignee-image' },
  });
  assigneeContainer.appendChild(assigneeImage);

  const assigneeNameElement = createElement({
    type: 'span',
    attributes: { class: 'assignee-name' },
    innerText: userFirstName,
  });
  assigneeContainer.appendChild(assigneeNameElement);

  const extensionCardButtons = createElement({
    type: 'div',
    attributes: { class: 'extension-card-buttons' },
  });
  cardAssigneeButtonContainer.appendChild(extensionCardButtons);

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
    attributes: { src: CHECK_ICON, alt: 'edit-icon' },
  });
  approveButton.appendChild(approveIcon);

  extensionCardButtons.appendChild(approveButton);

  const accordionButton = createElement({
    type: 'button',
    attributes: { class: 'accordion' },
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

  const reasonParagraph = createElement({ type: 'p', innerText: data.reason });
  reasonContainer.appendChild(reasonParagraph);

  const cardFooter = createElement({ type: 'div' });
  cardFooter.appendChild(cardAssigneeButtonContainer);

  cardFooter.appendChild(accordionContainer);

  rootElement.appendChild(cardFooter);

  //Event listeners
  editButton.addEventListener('click', () => {
    showModal('update-form');
    state.currentExtensionRequest = data;
    fillUpdateForm();
  });

  approveButton.addEventListener('click', () => {
    updateExtensionRequestStatus({
      id: data.id,
      body: { status: Status.APPROVED },
    });
  });

  denyButton.addEventListener('click', () => {
    updateExtensionRequestStatus({
      id: data.id,
      body: { status: Status.DENIED },
    });
  });

  return rootElement;
}
