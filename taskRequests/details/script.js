const API_BASE_URL = window.API_BASE_URL;

const taskRequestStatus = {
  WAITING: 'WAITING',
  APPROVED: 'APPROVED',
};

let taskRequest;

const taskRequestSkeleton = document.querySelector('.taskRequest__skeleton');
const taskSkeleton = document.querySelector('.task__skeleton');
const requestorSkeleton = document.querySelector(
  '.requestors__container__list__skeleton',
);

const taskRequestContainer = document.getElementById('task-request-details');
const taskContainer = document.getElementById('task-details');
const requestorsContainer = document.getElementById('requestors-details');

const taskRequestId = new URLSearchParams(window.location.search).get('id');
history.pushState({}, '', window.location.href);

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
          textContent: `#${taskRequest.id}`,
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
          textContent: taskRequest.status,
          class: [
            'taskRequest__status__chip',
            `taskRequest__status__chip--${taskRequest.status.toLowerCase()}`,
          ],
        }),
      ],
    }),
  );
}

async function renderTaskDetails(taskId) {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/details`);
    taskSkeleton.classList.add('hidden');
    const data = await res.json();

    const { taskData } = data ?? {};

    taskContainer.append(
      createCustomElement({
        tagName: 'h2',
        class: 'task__title',
        textContent: taskData?.title || 'N/A',
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
                  `task__type__chip--${taskData.type}`,
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
            tagName: 'p',
            textContent: taskData?.createdBy || 'N/A',
          }),
        ],
      }),
      createCustomElement({
        tagName: 'p',
        class: 'task__purpose',
        textContent: taskData?.purpose || 'N/A',
      }),
    );
  } catch (e) {
    console.error(e);
  }
}

function getAvatar(user) {
  if (user.user?.picture?.url) {
    return createCustomElement({
      tagName: 'img',
      src: user.user.picture.url,
      alt: user.user.first_name,
      title: user.user.first_name,
    });
  }
  return createCustomElement({
    tagName: 'span',
    title: user.user.first_name,
    textContent: user.user.first_name[0],
  });
}

async function approveTaskRequest(userId) {
  try {
    console.error(taskRequestId, userId);
    const res = await fetch(`${API_BASE_URL}/taskRequests/approve`, {
      credentials: 'include',
      method: 'PATCH',
      body: JSON.stringify({
        taskRequestId: taskRequestId,
        userId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      taskRequest = await fetchTaskRequest();
      requestorsContainer.innerHTML = '';
      renderRequestors(taskRequest.requestors);
    }
  } catch (e) {
    console.error(e);
  }
}

function getActionButton(requestor) {
  if (taskRequest.status === taskRequestStatus.APPROVED) {
    if (taskRequest?.approvedTo === requestor.user.id) {
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
      { event: 'click', func: () => approveTaskRequest(requestor.user.id) },
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

  data.forEach((requestor) => {
    requestorsContainer.append(
      createCustomElement({
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
                textContent: requestor.user.first_name,
              }),
            ],
          }),
          getActionButton(requestor),
        ],
      }),
    );
  });
}

async function fetchTaskRequest() {
  const res = await fetch(`${API_BASE_URL}/taskRequests/${taskRequestId}`);
  const data = await res.json();
  return data.data;
}

const renderTaskRequest = async () => {
  taskRequestSkeleton.classList.remove('hidden');
  taskContainer.classList.remove('hidden');
  try {
    taskRequest = await fetchTaskRequest();
    taskRequestSkeleton.classList.add('hidden');

    renderTaskRequestDetails(taskRequest);
    renderTaskDetails(taskRequest.taskId);
    renderRequestors(taskRequest.requestors);
  } catch (e) {
    console.error(e);
  }
};

renderTaskRequest();
