const API_BASE_URL = window.API_BASE_URL;

let taskRequest;

const taskRequestSkeleton = document.querySelector('.taskRequest__skeleton');
const taskSkeleton = document.querySelector('.task__skeleton');
const requestorSkeleton = document.querySelector(
  '.requestors__container__list__skeleton',
);

const taskRequestContainer = document.getElementById('task-request-details');
const taskContainer = document.getElementById('task-details');
const toast = document.getElementById('toast_task_details');
const requestorsContainer = document.getElementById('requestors-details');

const taskRequestId = new URLSearchParams(window.location.search).get('id');
history.pushState({}, '', window.location.href);
const errorMessage =
  'The requested operation could not be completed. Please try again later.';
let taskId;

function renderTaskRequestDetails(taskRequest) {
  taskRequestContainer.append(
    createCustomElement({
      tagName: 'h1',
      textContent: `Task Request `,
      class: 'taskRequest__title',
      child: [
        createCustomElement({
          tagName: 'span',
          class: 'taskRequest__title__subtitle',
          textContent: `#${taskRequest?.id}`,
        }),
      ],
    }),
    createCustomElement({
      tagName: 'p',
      textContent: 'Status: ',
      class: 'taskRequest__status',
      child: [
        createCustomElement({
          tagName: 'span',
          textContent: taskRequest?.status,
          class: [
            'taskRequest__status__chip',
            `taskRequest__status__chip--${taskRequest?.status?.toLowerCase()}`,
          ],
        }),
      ],
    }),
    createCustomElement({
      tagName: 'p',
      textContent: 'Request Type: ',
      class: 'taskRequest__status',
      child: [
        createCustomElement({
          tagName: 'span',
          textContent: taskRequest?.requestType || 'ASSIGNMENT',
          class: [
            'taskRequest__status__chip',
            `taskRequest__status__chip--tag`,
          ],
        }),
      ],
    }),
  );
}

async function renderTaskDetails(taskRequest) {
  const { taskId, taskTitle } = taskRequest;
  try {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/details`);
    taskSkeleton.classList.add('hidden');
    const data = await res.json();
    let taskReqAssigneeName = await getAssigneeName();

    const { taskData } = data ?? {};

    taskContainer.append(
      createCustomElement({
        tagName: 'h2',
        class: 'task__title',
        textContent: taskData?.title || taskTitle || 'N/A',
      }),
      createCustomElement({
        tagName: 'p',
        class: 'task_type',
        textContent: 'Type: ',
        child: [
          taskData?.type
            ? createCustomElement({
                tagName: 'span',
                class: [
                  'task__type__chip',
                  `task__type__chip--${taskData?.type}`,
                ],
                textContent: taskData?.type,
              })
            : '',
          taskData?.isNoteworthy
            ? createCustomElement({
                tagName: 'span',
                class: ['task__type__chip', `task__type__chip--noteworthy`],
                textContent: 'Note worthy',
              })
            : '',
        ],
      }),
      createCustomElement({
        tagName: 'p',
        class: 'task__createdBy',
        textContent: `Created By: `,
        child: [
          createCustomElement({
            tagName: 'a',
            href: `https://members.realdevsquad.com/${taskData?.createdBy}`,
            textContent: taskData?.createdBy || 'N/A',
          }),
        ],
      }),
      createCustomElement({
        tagName: 'p',
        class: 'task__createdBy',
        textContent: `Purpose : ${taskData?.purpose ?? 'N/A'}`,
      }),
    );
    renderAssignedTo(taskReqAssigneeName);
  } catch (e) {
    console.error(e);
  }
}

function getAvatar(user) {
  if (user?.user?.picture?.url) {
    return createCustomElement({
      tagName: 'img',
      src: user?.user?.picture?.url,
      alt: user?.user?.first_name,
      title: user?.user?.first_name,
      className: 'circular-image',
    });
  }
  return createCustomElement({
    tagName: 'span',
    title: user?.user?.first_name,
    textContent: user?.user?.first_name[0],
  });
}

async function approveTaskRequest(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/taskRequests/approve`, {
      credentials: 'include',
      method: 'PATCH',
      body: JSON.stringify({
        taskRequestId,
        userId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      showToast('Task Approved Successfully', 'success');
      taskRequest = await fetchTaskRequest();
      requestorsContainer.innerHTML = '';
      renderRequestors(taskRequest?.requestors);
    } else {
      showToast(errorMessage, 'failure');
    }
  } catch (e) {
    showToast(errorMessage, 'failure');
    console.error(e);
  }
}

function getActionButton(requestor) {
  if (taskRequest?.status === taskRequestStatus.APPROVED) {
    if (taskRequest?.approvedTo === requestor?.user?.id) {
      return createCustomElement({
        tagName: 'p',
        textContent: 'Approved',
        class: ['requestors__container__list__approved'],
      });
    } else {
      return '';
    }
  }
  return createCustomElement({
    tagName: 'button',
    textContent: 'Approve',
    class: 'requestors__conatainer__list__button',
    eventListeners: [
      { event: 'click', func: () => approveTaskRequest(requestor.user?.id) },
    ],
  });
}

async function renderRequestors(requestors) {
  requestorSkeleton.classList.remove('hidden');
  const data = await Promise.all(
    requestors.map((requestor) => {
      return fetch(`${API_BASE_URL}/users/userId/${requestor}`).then((res) =>
        res.json(),
      );
    }),
  );

  requestorSkeleton.classList.add('hidden');

  data.forEach((requestor, index) => {
    const userDetailsDiv = createCustomElement({
      tagName: 'li',
      child: [
        createCustomElement({
          tagName: 'div',
          class: 'requestors__container__list__userDetails',
          child: [
            createCustomElement({
              tagName: 'div',
              class: 'requestors__container__list__userDetails__avatar',
              child: [getAvatar(requestor)],
            }),
            createCustomElement({
              tagName: 'p',
              textContent: requestor.user?.first_name,
            }),
          ],
        }),
        getActionButton(requestor),
      ],
    });
    const avatarDiv = userDetailsDiv.querySelector(
      '.requestors__container__list__userDetails__avatar',
    );
    const firstNameParagraph = userDetailsDiv.querySelector('p');
    avatarDiv.addEventListener('click', () => populateModalContent(index));
    firstNameParagraph.addEventListener('click', () =>
      populateModalContent(index),
    );
    requestorsContainer.append(userDetailsDiv);
  });
}

async function fetchTaskRequest() {
  const res = await fetch(`${API_BASE_URL}/taskRequests/${taskRequestId}`, {
    credentials: 'include',
  });

  const { data } = await res.json();
  return data;
}

const renderTaskRequest = async () => {
  taskRequestSkeleton.classList.remove('hidden');
  taskContainer.classList.remove('hidden');
  try {
    taskRequest = await fetchTaskRequest();
    taskRequestSkeleton.classList.add('hidden');

    renderTaskRequestDetails(taskRequest);
    renderTaskDetails(taskRequest);
    renderRequestors(taskRequest?.requestors);
  } catch (e) {
    console.error(e);
  }
};

function showToast(message, type) {
  toast.innerHTML = `<div class="message">${message}</div>`;
  toast.classList.remove('hidden');

  if (type === 'success') {
    toast.classList.add('success');
    toast.classList.remove('failure');
  } else if (type === 'failure') {
    toast.classList.add('failure');
    toast.classList.remove('success');
  }

  setTimeout(() => {
    toast.classList.add('hidden');
    toast.innerHTML = '';
  }, 5000);
}

async function getAssigneeName() {
  let userName = '';
  let res;
  if (taskRequest.approvedTo) {
    try {
      res = await fetch(
        `${API_BASE_URL}/users/userId/${taskRequest.approvedTo}`,
      );
    } catch (error) {
      console.error(error);
    }
    if (res.ok) {
      const userData = await res.json();
      userName = userData.user.first_name;
    }
  }
  return userName;
}

async function renderAssignedTo(userName) {
  const assignedToText = 'Assigned To: ';
  const linkOrText = userName.length
    ? `<a href="https://members.realdevsquad.com/${userName}">${userName}</a>`
    : 'N/A';

  taskContainer.append(
    createCustomElement({
      tagName: 'p',
      class: 'task__createdBy',
      id: 'task__createdBy',
      innerHTML: assignedToText + linkOrText,
    }),
  );
}

const modal = document.getElementById('requestor_details_modal');
const openModalBtn = document.getElementById('requestor_details_modal_open');
const closeModal = document.getElementById('requestor_details_modal_close');

closeModal.addEventListener('click', function () {
  modal.style.display = 'none';
});

window.addEventListener('click', function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
});

function getHumanReadableDate(timeStamp) {
  if (typeof timeStamp !== 'number') {
    return 'N/A';
  }
  const date = new Date(timeStamp * 1000);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
}

function populateModalContent(index) {
  if (
    !Array.isArray(taskRequest.users) ||
    index < 0 ||
    index >= taskRequest.users.length
  ) {
    showToast('No Data Available for this requestor', 'failure');
    return;
  }
  const modal = document.getElementById('requestor_details_modal');
  const userData = taskRequest.users[index];

  const modalContent = modal.querySelector('.requestor_details_modal_info');

  const proposedStartDateText = document.createElement('p');
  proposedStartDateText.setAttribute(
    'data-modal-start-date-text',
    'proposed-start-date-text',
  );
  proposedStartDateText.innerHTML = '<strong>Proposed Start Date:</strong>';

  const proposedStartDateValue = document.createElement('p');
  proposedStartDateValue.setAttribute(
    'data-modal-start-date-value',
    'proposed-start-date-value',
  );
  proposedStartDateValue.textContent = getHumanReadableDate(
    userData.proposedStartDate,
  );

  const proposedDeadlineText = document.createElement('p');
  proposedDeadlineText.setAttribute(
    'data-modal-end-date-text',
    'proposed-end-date-text',
  );
  proposedDeadlineText.innerHTML = '<strong>Proposed Deadline:</strong>';

  const proposedDeadlineValue = document.createElement('p');
  proposedDeadlineValue.setAttribute(
    'data-modal-end-date-value',
    'proposed-end-date-value',
  );
  proposedDeadlineValue.textContent = getHumanReadableDate(
    userData.proposedDeadline,
  );

  const descriptionText = document.createElement('p');
  descriptionText.setAttribute(
    'data-modal-description-text',
    'proposed-description-text',
  );
  descriptionText.innerHTML = '<strong>Description:</strong>';

  const descriptionValue = document.createElement('p');
  descriptionValue.setAttribute(
    'data-modal-description-value',
    'proposed-description-value',
  );
  descriptionValue.textContent = userData.description;

  const header = document.createElement('h2');
  header.setAttribute('data-modal-header', 'requestor-details-header');
  header.className = 'requestor_details_modal_heading';
  header.textContent = 'Requestor Details';

  modalContent.innerHTML = '';

  modalContent.appendChild(header);
  modalContent.appendChild(proposedStartDateText);
  modalContent.appendChild(proposedStartDateValue);
  modalContent.appendChild(proposedDeadlineText);
  modalContent.appendChild(proposedDeadlineValue);
  modalContent.appendChild(descriptionText);
  modalContent.appendChild(descriptionValue);
  modal.style.display = 'block';
}

renderTaskRequest();
