const API_BASE_URL = window.API_BASE_URL;
const oooRequestContainer = document.getElementById(OOO_CONTAINER_ID);
const searchBtn = document.getElementById(SEARCH_BUTTON_ID);
const params = new URLSearchParams(window.location.search);
const isDev = DEV_FEATURE_FLAG;
const loader = document.querySelector('.container__body__loader');
const startLoading = () => loader.classList.remove('hidden');
const stopLoading = () => loader.classList.add('hidden');
let isDataLoading = false;
let sortByValue = document.getElementById(SORT_DROPDOWN_ID).value;
let statusValue = document.getElementById(STATUS_DROPDOWN_ID).value;

searchBtn.addEventListener('click', async () => {
  sortByValue = document.getElementById(SORT_DROPDOWN_ID).value;
  statusValue = document.getElementById(STATUS_DROPDOWN_ID).value;
  changeFilter();
  await renderOooRequestCards({ state: statusValue, sort: sortByValue });
});

async function getOooRequests(query = {}) {
  let finalUrl = API_BASE_URL + '/requests' + getQueryParamsString(query);
  if (isDev) {
    finalUrl =
      API_BASE_URL + '/requests' + getQueryParamsString(query) + '&dev=true';
  }

  try {
    const res = await fetch(finalUrl, {
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      return data;
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
  oooRequestContainer.innerHTML = '';
  oooRequestContainer.appendChild(p);
}

const changeFilter = () => {
  oooRequestContainer.innerHTML = '';
};

function createTaskRequestCard(
  taskRequest,
  adminUserDetails,
  requesterUserDetails,
) {
  let {
    id,
    state,
    from,
    until,
    message,
    createdAt,
    lastModifiedBy,
    reason,
    updatedAt,
  } = taskRequest;
  let showAdminDetailsClass = 'notHidden';
  let showActionButtonClass = 'notHidden';
  if (
    state === 'PENDING' ||
    lastModifiedBy === undefined ||
    lastModifiedBy === null
  ) {
    showAdminDetailsClass = 'hidden';
  }
  if (state !== 'PENDING') {
    showActionButtonClass = 'hidden';
  }
  const createdDate = convertDateToReadableStringDate(createdAt);
  const createdDateInAgoFormat = dateDiff(
    Date.now(),
    createdAt,
    (s) => s + ' ago',
  );
  const fromDate = convertDateToReadableStringDate(from);
  const toDate = convertDateToReadableStringDate(until);
  let updatedDate = convertDateToReadableStringDate(updatedAt);
  const updatedDateInAgoFormat = dateDiff(
    Date.now(),
    updatedAt,
    (s) => s + ' ago',
  );

  const card = createCustomElement({
    tagName: 'div',
    class: 'ooo_request__card',
    child: [
      createCustomElement({
        tagName: 'div',
        class: 'requester__info__and__status',
        child: [
          createCustomElement({
            tagName: 'div',
            class: 'requester__info',
            child: [
              createCustomElement({
                tagName: 'div',
                class: 'request__card__footer__requestor__avatar',
                child: [
                  createCustomElement({
                    tagName: 'img',
                    src:
                      requesterUserDetails?.picture?.url ||
                      'https://dashboard.realdevsquad.com/images/avatar.png',
                  }),
                ],
              }),
              createCustomElement({
                tagName: 'div',
                class: 'requester__name',
                child: [
                  createCustomElement({
                    tagName: 'h4',
                    textContent:
                      getFullNameOfUser(requesterUserDetails) || 'NA',
                  }),
                  createCustomElement({
                    tagName: 'p',
                    textContent: createdDateInAgoFormat || 'NA',
                    class: 'tooltip-container',
                    child: [
                      createCustomElement({
                        tagName: 'span',
                        class: 'tooltip',
                        textContent: createdDate,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          createCustomElement({
            tagName: 'button',
            class: [
              'request__status',
              `request__status--${state.toLowerCase()}`,
            ],
            textContent:
              state.charAt(0).toUpperCase() + state.slice(1).toLowerCase() ||
              'NA',
          }),
        ],
      }),
      createCustomElement({
        tagName: 'div',
        class: 'request__content',
        child: [
          createCustomElement({
            tagName: 'p',
            textContent: message || 'NA',
          }),
          createCustomElement({
            tagName: 'div',
            class: 'request__timeline',
            child: [
              createCustomElement({
                tagName: 'p',
                child: [
                  createCustomElement({
                    tagName: 'span',
                    class: 'request__date__pill',
                    textContent: 'From',
                  }),
                  ` ${fromDate}` || 'NA',
                ],
              }),
              createCustomElement({
                tagName: 'p',
                child: [
                  createCustomElement({
                    tagName: 'span',
                    class: 'request__date__pill',
                    textContent: 'To',
                  }),
                  ` ${toDate}` || 'NA',
                ],
              }),
            ],
          }),
        ],
      }),
      createCustomElement({
        tagName: 'hr',
        class: 'horizontal__line__saperator',
      }),
      createCustomElement({
        tagName: 'div',
        class: ['admin__info__and__status', showAdminDetailsClass],
        child: [
          createCustomElement({
            tagName: 'div',
            class: 'admin__info',
            child: [
              createCustomElement({
                tagName: 'div',
                class: 'admin__card__footer__requestor__avatar',
                child: [
                  createCustomElement({
                    tagName: 'img',
                    src:
                      adminUserDetails?.picture?.url ||
                      'https://dashboard.realdevsquad.com/images/avatar.png',
                  }),
                ],
              }),
              createCustomElement({
                tagName: 'div',
                class: 'admin__name__and__remark',
                child: [
                  createCustomElement({
                    tagName: 'div',
                    class: 'admin__name',
                    child: [
                      createCustomElement({
                        tagName: 'h4',
                        textContent:
                          getFullNameOfUser(adminUserDetails) || 'NA',
                      }),
                      createCustomElement({
                        tagName: 'p',
                        textContent: updatedDateInAgoFormat || 'NA',
                        class: 'tooltip-container',
                        child: [
                          createCustomElement({
                            tagName: 'span',
                            class: 'tooltip',
                            textContent: updatedDate,
                          }),
                        ],
                      }),
                    ],
                  }),
                  createCustomElement({
                    tagName: 'p',
                    textContent: reason || 'No Remark Provided!',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      createCustomElement({
        tagName: 'div',
        class: ['action__container', showActionButtonClass],
        child: [
          createCustomElement({
            tagName: 'input',
            class: 'request__remark__input',
            id: `remark-text-${id}`,
            type: 'text',
            placeholder: 'Add Remark If Any...',
          }),
          createCustomElement({
            tagName: 'div',
            class: ['action__buttons__container'],
            child: [
              createCustomElement({
                tagName: 'button',
                class: ['request__action__btn', 'accept__btn'],
                id: `${id}`,
                textContent: 'Accept',
                eventListeners: [
                  {
                    event: 'click',
                    func: (e) => performAcceptRejectAction(true, e),
                  },
                ],
              }),
              createCustomElement({
                tagName: 'button',
                class: ['request__action__btn', 'reject__btn'],
                id: `${id}`,
                textContent: 'Reject',
                eventListeners: [
                  {
                    event: 'click',
                    func: (e) => performAcceptRejectAction(false, e),
                  },
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
  return card;
}

async function renderOooRequestCards(queries = {}) {
  let oooRequestResponse;
  try {
    isDataLoading = true;
    startLoading();
    oooRequestResponse = await getOooRequests(queries);
    for (const oooRequest of oooRequestResponse?.data || []) {
      let adminUserDetails;
      let requesterUserDetails = await getUserDetails(oooRequest.requestedBy);
      if (oooRequest.state !== 'PENDING') {
        adminUserDetails = await getUserDetails(oooRequest.lastModifiedBy);
      }
      oooRequestContainer.appendChild(
        createTaskRequestCard(
          oooRequest,
          adminUserDetails,
          requesterUserDetails,
        ),
      );
    }
  } catch (error) {
    console.error(error);
    showMessage('ERROR', ErrorMessages.SERVER_ERROR);
  } finally {
    stopLoading();
    isDataLoading = false;
    if (
      oooRequestContainer.innerHTML === '' ||
      oooRequestResponse === undefined ||
      oooRequestResponse?.data?.length === 0
    ) {
      showMessage('INFO', 'No OOO requests found!');
    }
  }
}

async function getUserDetails(id) {
  if (!id) return;
  const url = `${API_BASE_URL}/users?id=${id}`;
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const data = await res.json();

  return data?.user;
}

async function acceptRejectRequest(currState, id, remark) {
  let url = `${API_BASE_URL}/requests/${id}`;
  if (isDev) {
    url = `${API_BASE_URL}/requests/${id}?dev=true`;
  }
  try {
    const res = await fetch(url, {
      credentials: 'include',
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        type: 'OOO',
        reason: remark,
        state: currState,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
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
  }
  const data = await res.json();
  return data;
}

async function performAcceptRejectAction(isAccepted, e) {
  e.preventDefault();
  const requestId = e.target.id;
  let remark = document.getElementById(`remark-text-${requestId}`).value;
  if (remark === undefined || remark === '') {
    remark = null;
  }
  const response = await acceptRejectRequest(
    isAccepted ? 'APPROVED' : 'REJECTED',
    requestId,
    remark,
  );
  console.log(requestId);
  console.log(remark);
  if (response) {
    changeFilter();
    await renderOooRequestCards({ state: statusValue, sort: sortByValue });
  }
}

renderOooRequestCards({ state: statusValue, sort: sortByValue });
