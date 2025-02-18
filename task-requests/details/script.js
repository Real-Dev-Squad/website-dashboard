const API_BASE_URL = window.API_BASE_URL;
import { getIsSuperUser } from '../../applications/utils.js';
let taskRequest;
let isSuperUser;

const taskRequestSkeleton = document.querySelector('.taskRequest__skeleton');
const container = document.querySelector('.container');
const taskSkeleton = document.querySelector('.task__skeleton');
const requestorSkeleton = document.querySelector(
  '.requestors__container__list__skeleton',
);
const taskRequestContainer = document.getElementById('task-request-details');
const requestDetailContainer =
  document.getElementsByClassName('request-details');
const taskContainer = document.getElementById('task-details');
const toast = document.getElementById('toast_task_details');
const requestorsContainer = document.getElementById('requestors-details');
const taskRequestId = new URLSearchParams(window.location.search).get('id');
history.pushState({}, '', window.location.href);
const errorMessage =
  'The requested operation could not be completed. Please try again later.';
const params = new URLSearchParams(window.location.search);
const isDev = params.get('dev') === 'true';

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

function renderActionButton(requestor, taskRequest) {
  if (isDev) {
    if (isSuperUser) {
      if (taskRequest?.status === taskRequestStatus.APPROVED) {
        return taskRequest.approvedTo === requestor?.user?.id
          ? createCustomElement({
              tagName: 'p',
              textContent: 'Approved',
              class: ['requestors__container__list__status'],
            })
          : '';
      }
      return createCustomElement({
        tagName: 'button',
        textContent: 'Approve',
        class: 'requestors__conatainer__list__button',
        'data-testid': 'task-approve-button',
        eventListeners: [
          {
            event: 'click',
            func: () =>
              updateTaskRequest(TaskRequestAction.APPROVE, requestor.user?.id),
          },
        ],
      });
    }
    return createCustomElement({
      tagName: 'p',
      textContent:
        taskRequest.status[0].toUpperCase() +
        taskRequest.status.slice(1).toLowerCase(),
      class: ['requestors__container__list__status'],
      'data-testid': 'requestors-task-status',
    });
  } else {
    if (taskRequest?.status === taskRequestStatus.APPROVED) {
      if (taskRequest.approvedTo === requestor?.user?.id) {
        return createCustomElement({
          tagName: 'p',
          textContent: 'Approved',
          class: ['requestors__container__list__status'],
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
            isDev
              ? taskRequest.status !== 'DENIED'
                ? renderActionButton(requestor, taskRequest)
                : createCustomElement({
                    tagName: 'p',
                    textContent: 'Denied',
                    class: ['requestors__container__list__status'],
                    'data-testid': 'requestor-container-task-status',
                  })
              : taskRequest.status !== 'DENIED'
              ? renderActionButton(requestor, taskRequest)
              : '',
          ],
        }),
      ],
    });
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
  const converter = new showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    tasklists: true,
    simplifiedAutoLink: true,
    ghCodeBlocks: true,
    openLinksInNewWindow: true,
    disableForced4SpacesIndentedSublists: true,
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
  const body = DOMPurify.sanitize(res?.body ?? '').replace(/\n/g, '\n\n');
  const html = converter.makeHtml(body);
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
  if (isDev) {
    if (!isSuperUser) return;
    if (taskRequest?.status === 'PENDING') {
      const rejectContainer = createCustomElement({
        tagName: 'div',
        class: 'reject__container',
        child: [
          createCustomElement({
            tagName: 'button',
            textContent: 'Reject',
            id: 'reject-button',
            class: 'request-details__reject__button',
            'data-testid': 'task-reject-button',
          }),
        ],
      });

      requestDetailContainer[0].appendChild(rejectContainer);
      const rejectButton = rejectContainer.querySelector('#reject-button');

      rejectButton.addEventListener('click', async () => {
        const res = await updateTaskRequest(TaskRequestAction.REJECT);
        if (res?.ok) {
          rejectButton.remove();
        }
      });
    } else {
      const existingRejectContainer =
        document.querySelector('.reject__container');
      if (existingRejectContainer) {
        const rejectButton =
          existingRejectContainer.querySelector('#reject-button');
        if (rejectButton) {
          rejectButton.remove();
        }
      }
    }
  } else {
    const rejectContainer = document.querySelector('.reject__container');
    if (!rejectContainer) {
      const rejectContainer = createCustomElement({
        tagName: 'div',
        class: 'reject__container',
        child: [
          createCustomElement({
            tagName: 'button',
            textContent: 'Reject',
            id: 'reject-button',
            class: 'request-details__reject__button',
            'data-testid': 'task-reject-button',
          }),
        ],
      });

      requestDetailContainer[0].appendChild(rejectContainer);
    }
    const rejectButton = document.querySelector('#reject-button');
    if (taskRequest?.status !== 'PENDING') {
      rejectButton.disabled = true;
    }

    rejectButton.addEventListener('click', async () => {
      const res = await updateTaskRequest(TaskRequestAction.REJECT);
      if (res?.ok) {
        rejectButton.disabled = true;
      }
    });
  }
};

const renderTaskRequest = async () => {
  taskRequestSkeleton.classList.remove('hidden');
  taskContainer.classList.remove('hidden');
  try {
    taskRequest = await fetchTaskRequest();
    isSuperUser = await getIsSuperUser();
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
  if (params.get('dev') == 'true') {
    console.log(modal);
    modal.className = 'new_requestor_details_modal_content';
  }

  const userData = taskRequest.users[index];

  const modalContent = modal.querySelector('.requestor_details_modal_info');

  const proposedStartDateText = document.createElement('p');
  proposedStartDateText.setAttribute(
    'data-modal-start-date-text',
    'proposed-start-date-text',
  );
  if (params.get('dev') == 'true') {
    proposedStartDateText.innerText = 'Proposed Start Date:';
    proposedStartDateText.className = 'proposed-start-date-text';
  } else {
    proposedStartDateText.innerHTML = '<strong>Proposed Start Date:</strong>';
  }

  const proposedStartDateValue = document.createElement('p');
  proposedStartDateValue.setAttribute(
    'data-modal-start-date-value',
    'proposed-start-date-value',
  );
  if (params.get('dev') == 'true') {
    proposedStartDateValue.className = 'proposed-start-date-value';
  }
  proposedStartDateValue.textContent = getHumanReadableDate(
    userData.proposedStartDate,
  );

  const proposedDeadlineText = document.createElement('p');
  proposedDeadlineText.setAttribute(
    'data-modal-end-date-text',
    'proposed-end-date-text',
  );
  if (params.get('dev') == 'true') {
    proposedDeadlineText.innerText = 'Proposed Deadline:';
    proposedDeadlineText.className = 'proposed-end-date-text';
  } else {
    proposedDeadlineText.innerHTML = '<strong>Proposed Deadline:</strong>';
  }

  const proposedDeadlineValue = document.createElement('p');
  proposedDeadlineValue.setAttribute(
    'data-modal-end-date-value',
    'proposed-end-date-value',
  );
  if (params.get('dev') == 'true') {
    proposedDeadlineValue.className = 'proposed-end-date-value';
  }
  proposedDeadlineValue.textContent = getHumanReadableDate(
    userData.proposedDeadline,
  );

  const descriptionText = document.createElement('p');
  descriptionText.setAttribute(
    'data-modal-description-text',
    'proposed-description-text',
  );
  if (params.get('dev') == 'true') {
    descriptionText.innerText = 'Description:';
    descriptionText.className = 'proposed-description-text';
  } else {
    descriptionText.innerHTML = '<strong>Description:</strong>';
  }

  const descriptionValue = document.createElement('p');
  descriptionValue.setAttribute(
    'data-modal-description-value',
    'proposed-description-value',
  );

  if (userData?.markdownEnabled ?? false) {
    const converter = new showdown.Converter({
      tables: true,
      simplifiedAutoLink: true,
      tasklists: true,
      simplifiedAutoLink: true,
      ghCodeBlocks: true,
      openLinksInNewWindow: true,
    });
    const sanitizedDescription = DOMPurify.sanitize(userData.description ?? '');
    const html = converter.makeHtml(sanitizedDescription);
    descriptionValue.innerHTML = html;
    descriptionValue.className = 'requestor_description_details';
  } else {
    if (params.get('dev') == 'true') {
      if (userData.description) {
        descriptionValue.textContent = userData.description;
      } else {
        descriptionValue.textContent = 'N/A';
        descriptionValue.className = 'proposed-description-value';
      }
    } else {
      descriptionValue.textContent = userData.description;
    }
  }

  const header = document.createElement('h2');
  header.setAttribute('data-modal-header', 'requestor-details-header');
  header.className = 'requestor_details_modal_heading';
  header.textContent = 'Requestor Details';
  if (params.get('dev') == 'true') {
    header.className = 'new_requestor_details_modal_heading';
  }

  modalContent.innerHTML = '';

  modalContent.appendChild(header);

  if (params.get('dev') == 'true') {
    const proposedStartDateDiv = document.createElement('div');
    proposedStartDateDiv.className = 'proposed-start-date-div';

    const proposedDeadlineDiv = document.createElement('div');
    proposedDeadlineDiv.className = 'proposed-end-date-div';

    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'proposed-description-div';

    proposedStartDateDiv.appendChild(proposedStartDateText);
    proposedStartDateDiv.appendChild(proposedStartDateValue);
    modalContent.appendChild(proposedStartDateDiv);

    proposedDeadlineDiv.appendChild(proposedDeadlineText);
    proposedDeadlineDiv.appendChild(proposedDeadlineValue);
    modalContent.appendChild(proposedDeadlineDiv);

    descriptionDiv.appendChild(descriptionText);
    descriptionDiv.appendChild(descriptionValue);
    modalContent.appendChild(descriptionDiv);
  } else {
    modalContent.appendChild(proposedStartDateText);
    modalContent.appendChild(proposedStartDateValue);

    modalContent.appendChild(proposedDeadlineText);
    modalContent.appendChild(proposedDeadlineValue);

    modalContent.appendChild(descriptionText);
    modalContent.appendChild(descriptionValue);
  }

  modalOverlay.style.display = 'block';
}

renderTaskRequest();
