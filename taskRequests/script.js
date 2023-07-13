const taskRequestStatus = {
  WAITING: 'WAITING',
  APPROVED: 'APPROVED',
};

const API_BASE_URL = window.API_BASE_URL;
const taskRequestContainer = document.getElementById('task-request-container');
const containerBody = document.querySelector('.container__body');

const fetchedTaskRequests = [];

const loader = document.querySelector('.container__body__loader');
const startLoading = () => loader.classList.remove('hidden');
const stopLoading = () => loader.classList.add('hidden');

function createCustomElement(domObjectMap) {
  const el = document.createElement(domObjectMap.tagName);
  for (const [key, value] of Object.entries(domObjectMap)) {
    if (key === 'tagName') {
      continue;
    }
    if (key === 'class') {
      if (Array.isArray(value)) {
        el.classList.add(...value);
      } else {
        el.classList.add(value);
      }
    } else if (key === 'child') {
      el.append(...value);
    } else {
      el[key] = value;
    }
  }
  return el;
}

async function getTaskRequests() {
  startLoading();
  try {
    const res = await fetch(`http://localhost:3000/taskRequests`);

    if (res.ok) {
      const data = await res.json();
      fetchedTaskRequests = [...data.data];
      return;
    }

    if (res.status === 401) {
      showMessage(
        'ERROR',
        'You are unauthenticated to view this section, please login!',
      );
      return;
    }

    if (res.status === 403) {
      showMessage('ERROR', 'You are unauthrozed to view this section');
      return;
    }

    showMessage('ERROR', 'Unexpected error occurred');
  } catch (e) {
    console.log(e);
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
      src: 'user.user?.picture?.url',
    });
  }
  return createCustomElement({
    tagName: 'span',
    textContent: user.user.charAt(0),
  });
}
function getRemainingCount(requestors) {
  if(requestors.length > 3) {
    return createCustomElement({
      tagName: 'span',
      textContent: `+${requestors.length - 3}`,
    })
  }
}

function createTaskRequestCard({ title, description, requestors, status }) {
  const card = createCustomElement({
    tagName: 'div',
    class: 'taskRequest__card',
    child: [
      createCustomElement({
        tagName: 'div',
        class: 'taskRequest__card__header',
        child: [
          createCustomElement({
            tagName: 'h3',
            class: 'taskRequest__card__header__title',
            textContent: title,
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
            textContent: description,
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
                if (index < 2) {
                  return createCustomElement({
                    tagName: 'div',
                    class: 'taskRequest__card__footer__requestor__avatar',
                    title: requestor.user.first_name,
                    child: [getAvatar(requestor)],
                  });
                }
              }),
              getRemainingCount(requestors),
            ],
          }),
        ],
      }),
    ],
  });
  return card;
}
