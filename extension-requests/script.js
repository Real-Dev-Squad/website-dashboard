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

const state = {
  currentExtensionRequest: null,
};

const render = async () => {
  try {
    addLoader(container);
    const extensionRequests = await getExtensionRequests();
    const allExtensionRequests = extensionRequests.allExtensionRequests;
    allExtensionRequests.forEach((data) => {
      extensionRequestsContainer.appendChild(createExtensionRequestCard(data));
    });
  } catch (error) {
    errorHeading.textContent = 'Something went wrong';
    errorHeading.classList.add('error-visible');
    reload();
  } finally {
    removeLoader();
  }
};

const showTaskDetails = async (taskId) => {
  if (!taskId) return;
  try {
    modalShowInfo.innerHTML = '<h3>Task Details</h3>';
    addLoader(modalShowInfo);
    const taskDetails = await getTaskDetails(taskId);
    const taskData = taskDetails.taskData;
    modalShowInfo.append(createTaskInfoModal(taskData));
  } catch (error) {
    errorHeading.textContent = 'Something went wrong';
    errorHeading.classList.add('error-visible');
    reload();
  } finally {
    removeLoader();
  }
};

function updateStatusForm() {
  document.querySelector('.extensionId').value =
    state.currentExtensionRequest.id;
  document.querySelector('.extensionTitle').value =
    state.currentExtensionRequest.title;
  document.querySelector('.extensionAssignee').value =
    state.currentExtensionRequest.assignee;
}

function createTaskInfoModal(data) {
  if (!data) return;

  const dataHeadings = [
    { title: 'Title' },
    { title: 'Ends On', key: 'endsOn', time: true },
    { title: 'Purpose' },
    { title: 'Assignee' },
    { title: 'Created By', key: 'createdBy' },
    { title: 'Is Noteworthy', key: 'isNoteworthy' },
  ];

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
    updateStatusForm();
  });
  closeModal.addEventListener('click', () => hideModal());

  const main = createTable(dataHeadings, data);

  main.appendChild(updateStatus);
  main.appendChild(closeModal);
  return main;
}

function createExtensionRequestCard(data) {
  if (!data) return;

  const dataHeadings = [
    { title: 'Title' },
    { title: 'Reason' },
    { title: 'Old Ends On', key: 'oldEndsOn', time: true },
    { title: 'New Ends On', key: 'newEndsOn', time: true },
    { title: 'Status', bold: true },
    { title: 'Assignee' },
    { title: 'Created At', key: 'timestamp', time: true },
    { title: 'Task', key: 'taskId' },
  ];

  const moreInfoBtn = createElement({
    type: 'button',
    attributes: { class: 'more' },
    innerText: 'More',
  });
  moreInfoBtn.addEventListener('click', () => {
    showModal('info');
    showTaskDetails(data.taskId);
    state.currentExtensionRequest = data;
  });

  const main = createTable(dataHeadings, data, 'extension-request');

  main.appendChild(moreInfoBtn);
  return main;
}

render();

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
