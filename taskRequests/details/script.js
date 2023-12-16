const API_BASE_URL = window.API_BASE_URL;

let taskRequest;

const taskRequestSkeleton = document.querySelector('.taskRequest__skeleton');
const container = document.querySelector('.container');
const taskSkeleton = document.querySelector('.task__skeleton');
const requestorSkeleton = document.querySelector(
  '.requestors__container__list__skeleton',
);

const taskRequestContainer = document.getElementById('task-request-details');
const taskContainer = document.getElementById('task-details');
const toast = document.getElementById('toast_task_details');
const rejectButton = document.getElementById('reject-button');
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
          id: 'taskRequest__status_text',
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

function updateStatus(status) {
  const statusText = document.getElementById('taskRequest__status_text');
  statusText.classList = [];
  statusText.classList.add('taskRequest__status__chip');
  statusText.classList.add(
    `taskRequest__status__chip--${status?.toLowerCase()}`,
  );
  statusText.textContent = status;
}

async function renderTaskDetails(taskRequest) {
  const { taskId, taskTitle } = taskRequest;
  try {
    requestorsContainer.classList.add('requester-border');
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

async function updateTaskRequest(action, userId) {
  const removeSpinner = addSpinner(container);
  container.classList.add('container-disabled');
  try {
    const queryParams = new URLSearchParams({ action: action });
    const res = await fetch(`${API_BASE_URL}/taskRequests?${queryParams}`, {
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
      showToast('Task updated Successfully', 'success');
      taskRequest = await fetchTaskRequest();
      requestorsContainer.innerHTML = '';
      updateStatus(taskRequest.status);
      renderRequestors(taskRequest);
      renderRejectButton(taskRequest);
      return res;
    } else {
      showToast(errorMessage, 'failure');
    }
  } catch (e) {
    showToast(errorMessage, 'failure');
    console.error(e);
  } finally {
    removeSpinner();
    container.classList.remove('container-disabled');
  }
}

function getActionButton(requestor) {
  if (taskRequest?.status === taskRequestStatus.APPROVED) {
    if (taskRequest.approvedTo === requestor?.user?.id) {
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
      {
        event: 'click',
        func: () =>
          updateTaskRequest(TaskRequestAction.APPROVE, requestor.user?.id),
      },
    ],
  });
}

async function renderRequestors(taskRequest) {
  const requestors = taskRequest?.users;
  requestorSkeleton.classList.remove('hidden');
  const data = await Promise.all(
    requestors.map((requestor) => {
      return fetch(`${API_BASE_URL}/users/userId/${requestor.userId}`).then(
        (res) => res.json(),
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
              tagName: 'div',
              class: 'requestors__container__list__userDetails__info',
              child: [
                createCustomElement({
                  tagName: 'p',
                  class: 'info__name',
                  textContent: requestor.user?.first_name,
                }),
                createCustomElement({
                  tagName: 'a',
                  textContent: 'details>',
                  class: 'info__more',
                  eventListeners: [
                    {
                      event: 'click',
                      func: () => populateModalContent(index),
                    },
                  ],
                }),
              ],
            }),
          ],
        }),
        createCustomElement({
          tagName: 'div',
          child: [
            taskRequest.status !== 'DENIED' ? getActionButton(requestor) : '',
          ],
        }),
      ],
    });
    const avatarDiv = userDetailsDiv.querySelector(
      '.requestors__container__list__userDetails__avatar',
    );
    requestorsContainer.append(userDetailsDiv);
  });
}

async function fetchTaskRequest() {
  const res = await fetch(`${API_BASE_URL}/taskRequests/${taskRequestId}`, {
    credentials: 'include',
  });

  const { data } = await res.json();
  const approvedTo = data.users
    .filter((user) => user.status === 'APPROVED')
    ?.map((user) => user.userId)?.[0];
  data.approvedTo = approvedTo;
  return data;
}

const renderGithubIssue = async () => {
  converter = new showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    tasklists: true,
    simplifiedAutoLink: true,
    ghCodeBlocks: true,
    openLinksInNewWindow: true,
  });
  let res = await fetch(taskRequest?.externalIssueUrl);
  res = await res.json();
  taskSkeleton.classList.add('hidden');
  taskContainer.classList.add('task__issue__container');
  taskContainer.append(
    createCustomElement({
      tagName: 'h2',
      innerHTML: res?.title,
      id: 'issue_title',
    }),
  );
  taskContainer.appendChild(
    createCustomElement({
      tagName: 'p',
      id: 'issue_time_author',
      child: [
        createCustomElement({
          tagName: 'span',
          textContent:
            'Opened on ' + new Date(res?.created_at).toDateString() + ' by ',
        }),
        createCustomElement({
          tagName: 'a',
          href: res?.user?.html_url,
          textContent: res?.user?.login,
        }),
      ],
    }),
  );
  html = converter.makeHtml(res?.body);
  taskContainer.appendChild(
    createCustomElement({
      tagName: 'div',
      innerHTML: html,
    }),
  );

  if (res?.assignee) {
    taskContainer.appendChild(
      createCustomElement({
        tagName: 'p',
        id: 'issue_assignee',
        child: [
          createCustomElement({
            tagName: 'span',
            child: [
              createCustomElement({
                tagName: 'span',
                textContent: 'Assigned to: ',
              }),
              createCustomElement({
                tagName: 'a',
                class: 'card__link',
                textContent: res?.assignee?.login,
                href: res?.assignee?.html_url,
              }),
            ],
          }),
        ],
      }),
    );
  }
  taskContainer.appendChild(
    createCustomElement({
      tagName: 'p',
      id: 'issue_link',
      class: 'card__link_issue',
      child: [
        createCustomElement({
          tagName: 'span',
          textContent: 'Issue link: ',
        }),
        createCustomElement({
          tagName: 'a',
          class: 'card__link',
          textContent: res?.html_url,
          href: res?.html_url || '#',
        }),
      ],
    }),
  );
  taskContainer.appendChild(
    createCustomElement({
      tagName: 'div',
      child: res?.labels.map((label) =>
        createCustomElement({
          tagName: 'button',
          textContent: label?.name,
          class: 'card__tag',
        }),
      ),
    }),
  );
};
const renderRejectButton = (taskRequest) => {
  if (taskRequest?.status !== 'PENDING') {
    rejectButton.disabled = true;
  }

  rejectButton.addEventListener('click', async () => {
    const res = await updateTaskRequest(TaskRequestAction.REJECT);
    if (res?.ok) {
      rejectButton.disabled = true;
    }
  });
};
const renderTaskRequest = async () => {
  taskRequestSkeleton.classList.remove('hidden');
  taskContainer.classList.remove('hidden');
  try {
    taskRequest = await fetchTaskRequest();
    taskRequestSkeleton.classList.add('hidden');
    renderRejectButton(taskRequest);
    renderTaskRequestDetails(taskRequest);

    if (taskRequest?.requestType === 'CREATION') {
      renderGithubIssue();
    } else if (taskRequest?.requestType === 'ASSIGNMENT') {
      renderTaskDetails(taskRequest);
    }
    renderRequestors(taskRequest);
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

const openModalBtn = document.getElementById('requestor_details_modal_open');
const closeModal = document.getElementById('requestor_details_modal_close');

const modalOverlay = document.getElementById('overlay');

closeModal.addEventListener('click', function () {
  modalOverlay.style.display = 'none';
});
modalOverlay.addEventListener('click', function (event) {
  if (event.target == modalOverlay) {
    modalOverlay.style.display = 'none';
  }
});

function populateModalContent(index) {
  if (
    !Array.isArray(taskRequest.users) ||
    index < 0 ||
    index >= taskRequest.users.length
  ) {
    showToast('No Data Available for this requestor', 'failure');
    return;
  }
  const modal = document.getElementById('requestor_details_modal_content');
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
  modalOverlay.style.display = 'block';
}

renderTaskRequest();
