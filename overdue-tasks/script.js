const container = document.querySelector('.container');
const overdueTasksContainer = document.querySelector('.overdue-tasks');

const errorHeading = document.querySelector('h2#error');
const modalParent = document.querySelector('.overdue-tasks-modal-parent');
const closeModal = document.querySelectorAll('#close-modal');

//modal containers
const modalShowPrompt = document.querySelector('.overdue-tasks-prompt');
const modalCreateForm = document.querySelector('.extension-requests-form');

//pathname
const url = window.location.href;

const state = {
  task: null,
  dev: new URL(url).searchParams.get('dev'),
};

const render = async () => {
  try {
    addLoader(container);
    const overdueTasks = await getCurrentOverdueTasks();
    const alloverdueTasks = overdueTasks.overdueTasks;
    alloverdueTasks.forEach((data) => {
      overdueTasksContainer.appendChild(
        createOverdueTasksCard(data, taskInfoModelHeadings),
      );
    });
    checkTaskExtensionDetails(alloverdueTasks);
  } catch (error) {
    errorHeading.textContent = 'Something went wrong';
    errorHeading.classList.add('error-visible');
    reload();
  } finally {
    removeLoader('loader');
  }
};

// to check if there are already extension requests created for this
// async function checkTaskExtensionDetails(tasks){
//   await Promise.all(
//     tasks.map(async (task) => {
//       let extensionRequestResponse = await getExtensionRequests({taskId: task.id, status: "PENDING"})
//       let extensionRequests = extensionRequestResponse.allExtensionRequests

//       if (extensionRequests.length){
//         task_extensionRequest_button = document.querySelector(`.create-extension-btn-${task.id}`)
//         task_extensionRequest_button.disabled = true
//         task_extensionRequest_button.innerText = "Extension Requests Exists"
//       }
//     })
//   );
// }

function createOverdueTasksCard(data, dataHeadings) {
  if (!data) return;

  const unassignBtn = createElement({
    type: 'button',
    attributes: { class: 'unassign-task-btn' },
    innerText: 'Unassign Task',
  });
  const createExtensionBtn = createElement({
    type: 'button',
    attributes: {
      class: `create-extension-btn create-extension-btn-${data.id}`,
    },
    innerText: 'Create Extension For this',
  });
  unassignBtn.addEventListener('click', () => {
    showModal();
    state.task = data;
    unassignTaskTrigger();
  });
  createExtensionBtn.addEventListener('click', () => {
    state.task = data;
    fillCreateForm();
    showModal('form');
  });

  const main = createTable(dataHeadings, data, 'overdue-task-container');

  main.appendChild(unassignBtn);
  main.appendChild(createExtensionBtn);
  return main;
}
render();

//PATCH requests functions
async function onCreateFormSubmit(e) {
  e.preventDefault();
  try {
    addLoader(container);
    let formData = formDataToObject(new FormData(e.target));
    formData['oldEndsOn'] = new Date(formData['oldEndsOn']).getTime() / 1000;
    formData['newEndsOn'] = new Date(formData['newEndsOn']).getTime() / 1000;
    await createExtensionRequest(formData);
    // reload();
  } catch (error) {
    errorHeading.textContent = 'Something went wrong';
    errorHeading.classList.add('error-visible');
    // reload();
  } finally {
    removeLoader('loader');
  }
}
modalCreateForm.addEventListener('submit', onCreateFormSubmit);

modalParent.addEventListener('click', hideModal);
closeModal.forEach((node) => node.addEventListener('click', () => hideModal()));

function showModal(state = 'prompt') {
  modalParent.classList.add('visible');
  modalParent.setAttribute('state', state);
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
  if (state.dev) return;
  setTimeout(() => window.history.go(0), 2000);
}

function fillCreateForm() {
  modalCreateForm.querySelector('.extensionId').value = state.task.id;
  modalCreateForm.querySelector('.extensionTitle').value = state.task.title;
  modalCreateForm.querySelector('.extensionAssignee').value =
    state.task.assignee;
  modalCreateForm.querySelector('.extensionStatus').value = 'PENDING';
  modalCreateForm.querySelector('.extensionOldEndsOn').value = new Date(
    state.task.endsOn * 1000,
  )
    .toISOString()
    .replace('Z', '');
}

function unassignTaskTrigger() {
  let success_btn = modalShowPrompt.querySelector('.prompt_success');
  let failure_btn = modalShowPrompt.querySelector('.prompt_failure');

  if (state.task.assignee) {
    modalShowPrompt.querySelector(
      'h2',
    ).innerHTML = `Unassign ${state.task.assignee} of <i>${state.task.title}</i> task`;
  } else {
    modalShowPrompt.querySelector(
      'h2',
    ).innerHTML = `Make this task <i>AVAILABLE</i>`;
  }

  success_btn.addEventListener('click', async function () {
    addLoader(modalShowPrompt);
    unassignSuccess = await unassignTask(state.task.id);
    removeLoader('overdue-tasks-prompt');
    if (unassignSuccess) {
      hideModal();
      reload();
    }
  });

  failure_btn.onclick = async function () {
    hideModal();
  };
}
