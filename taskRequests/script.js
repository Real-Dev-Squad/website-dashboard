const API_BASE_URL = window.API_BASE_URL;
const taskRequestContainer = document.getElementById('task-request-container');
const containerBody = document.querySelector('.container__body');
const filterContainer = document.querySelector('.container__filters');

const fetchedTaskRequests = [];

const loader = document.querySelector('.container__body__loader');
const startLoading = () => loader.classList.remove('hidden');
const stopLoading = () => loader.classList.add('hidden');

async function getTaskRequests() {
  startLoading();
  try {
    const res = await fetch(`${API_BASE_URL}/taskRequests`);

    if (res.ok) {
      const data = await res.json();
      fetchedTaskRequests.push(...data.data);
      return;
    }

    if (res.status === 401) {
      showMessage('ERROR', ErrorMessages.UNAUTHENTICATED);
      return;
    }

    if (res.status === 403) {
      showMessage('ERROR', ErrorMessages.UNAUTHORIZED);
      return;
    }

    if (res.status === 404) {
      showMessage('ERROR', ErrorMessages.NOT_FOUND);
      return;
    }

    showMessage('ERROR', ErrorMessages.SERVER_ERROR);
  } catch (e) {
    console.error(e);
  } finally {
    stopLoading();
  }
}

function showMessage(type, message) {
  const p = document.createElement('p');
  const classes = ['taskRequest__message'];
  if (type === 'ERROR') {
    classes.push('taskRequest__message--error');
  }
  p.classList.add(...classes);
  p.textContent = message;
  containerBody.innerHTML = '';
  containerBody.appendChild(p);
}

function getAvatar(user) {
  if (user.user?.picture?.url) {
    return createCustomElement({
      tagName: 'img',
      src: user.user?.picture?.url,
    });
  }
  return createCustomElement({
    tagName: 'span',
    textContent: user.user.first_name[0],
  });
}
function getRemainingCount(requestors) {
  if (requestors.length > 3) {
    return createCustomElement({
      tagName: 'span',
      textContent: `+${requestors.length - 3}`,
    });
  }
}
function openTaskDetails(id) {
  const url = new URL(`/taskRequests/details`, window.location.href);

  url.searchParams.append('id', id);
  window.location.href = url;
}

function createTaskRequestCard({ id, task, requestors, status }) {
  const card = createCustomElement({
    tagName: 'div',
    class: 'taskRequest__card',
    eventListeners: [{ event: 'click', func: (e) => openTaskDetails(id, e) }],
    child: [
      createCustomElement({
        tagName: 'div',
        class: 'taskRequest__card__header',
        child: [
          createCustomElement({
            tagName: 'h3',
            class: 'taskRequest__card__header__title',
            textContent: task.title,
          }),
          createCustomElement({
            tagName: 'div',
            class: [
              'taskRequest__card__header__status',
              `taskRequest__card__header__status--${status.toLowerCase()}`,
            ],
            title: status.toLowerCase(),
          }),
        ],
      }),
      createCustomElement({
        tagName: 'div',
        class: 'taskRequest__card__body',
        child: [
          createCustomElement({
            tagName: 'p',
            textContent: task.purpose,
          }),
        ],
      }),
      createCustomElement({
        tagName: 'div',
        class: 'taskRequest__card__footer',
        child: [
          createCustomElement({
            tagName: 'p',
            textContent: 'Requested By',
          }),
          createCustomElement({
            tagName: 'div',
            class: 'taskRequest__card__footer__requestor',
            child: [
              ...requestors.map((requestor, index) => {
                if (index < 3) {
                  return createCustomElement({
                    tagName: 'div',
                    class: 'taskRequest__card__footer__requestor__avatar',
                    title: requestor.user.first_name,
                    child: [getAvatar(requestor)],
                  });
                }
              }),
              getRemainingCount(requestors) || '',
            ],
          }),
        ],
      }),
    ],
  });
  return card;
}

function renderTaskRequestCards(taskRequests) {
  if (taskRequests.length > 0) {
    filterContainer.classList.remove('hidden');
    taskRequests.forEach((taskRequest) => {
      taskRequestContainer.appendChild(createTaskRequestCard(taskRequest));
    });
  }
}

(async () => {
  await getTaskRequests();
  renderTaskRequestCards(fetchedTaskRequests);
})();
