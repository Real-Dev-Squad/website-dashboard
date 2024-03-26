const API_BASE_URL = window.API_BASE_URL;
const requestContainer = document.getElementById(REQUEST_CONTAINER_ID);
const lastElementContainer = document.querySelector(LAST_ELEMENT_CONTAINER);

const params = new URLSearchParams(window.location.search);
const isDev = params.get('dev') === 'true';
const loader = document.querySelector('.container__body__loader');
const startLoading = () => loader.classList.remove('hidden');
const stopLoading = () => loader.classList.add('hidden');
let oooTabLink = document.getElementById(OOO_TAB_ID);
let currentReqType = OOO_REQUEST_TYPE;
let selected__tab__class = 'selected__tab';
let statusValue = null;
let sortByValue = null;
let userDetails = [];
let nextLink = '';
let isDataLoading = false;

function getUserDetails(id) {
  return userDetails.find((user) => user.id === id);
}

const intersectionObserver = new IntersectionObserver(async (entries) => {
  if (!nextLink) {
    return;
  }
  if (entries[0].isIntersecting && !isDataLoading) {
    await renderOooRequestCards({
      state: statusValue,
      sort: sortByValue,
      next: nextLink,
    });
  }
});

const addIntersectionObserver = () => {
  intersectionObserver.observe(lastElementContainer);
};
const removeIntersectionObserver = () => {
  intersectionObserver.unobserve(lastElementContainer);
};

oooTabLink.addEventListener('click', async function () {
  if (isDataLoading) return;
  oooTabLink.classList.add(selected__tab__class);
  currentReqType = OOO_REQUEST_TYPE;
  changeFilter();
  await renderOooRequestCards({ state: statusValue, sort: sortByValue });
});

async function getOooRequests(query = {}) {
  let finalUrl =
    API_BASE_URL + (nextLink || '/requests' + getOooQueryParamsString(query));
  let windowUrl = `${window.location.origin}${window.location.pathname}`;

  window.history.pushState({ path: windowUrl }, '', windowUrl);

  try {
    const res = await fetch(finalUrl, {
      credentials: 'include',
    });

    const data = await res.json();
    if (res.ok) {
      return data;
    } else {
      switch (res.status) {
        case 401:
          showMessage('ERROR', ErrorMessages.UNAUTHENTICATED);
          return;
        case 403:
          showMessage('ERROR', ErrorMessages.UNAUTHORIZED);
          return;
        case 404:
          showMessage('ERROR', ErrorMessages.OOO_NOT_FOUND);
          return;
        case 400:
          showMessage('ERROR', data.message);
          showToast(data.message, 'failure');
          return;
        default:
          break;
      }
    }
    showMessage('ERROR', ErrorMessages.SERVER_ERROR);
  } catch (e) {
    console.error(e);
  }
}

function showMessage(type, message) {
  const p = document.createElement('p');
  const classes = ['request__message'];
  switch (type) {
    case 'ERROR':
      classes.push('request__message--error');
      break;
  }
  p.classList.add(...classes);
  p.textContent = message;
  requestContainer.innerHTML = '';
  requestContainer.appendChild(p);
}

const changeFilter = () => {
  requestContainer.innerHTML = '';
};

function createOooRequestCard(
  oooRequest,
  superUserDetails,
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
  } = oooRequest;
  let showSuperuserDetailsClass = 'notHidden';
  let showActionButtonClass = 'notHidden';
  if (
    state === 'PENDING' ||
    lastModifiedBy === undefined ||
    lastModifiedBy === null
  ) {
    showSuperuserDetailsClass = 'hidden';
  }
  if (state !== 'PENDING') {
    showActionButtonClass = 'hidden';
  }
  const createdDate = convertDateToReadableStringDate(
    createdAt,
    DEFAULT_DATE_FORMAT,
  );
  const createdDateInAgoFormat = dateDiff(
    Date.now(),
    createdAt,
    (s) => s + ' ago',
  );
  const fromDate = convertDateToReadableStringDate(from, DEFAULT_DATE_FORMAT);
  const toDate = convertDateToReadableStringDate(until, DEFAULT_DATE_FORMAT);
  let updatedDate = convertDateToReadableStringDate(
    updatedAt,
    DEFAULT_DATE_FORMAT,
  );
  const updatedDateInAgoFormat = dateDiff(
    Date.now(),
    updatedAt,
    (s) => s + ' ago',
  );

  const card = createElementFromMap({
    tagName: 'div',
    class: 'ooo_request__card',
    child: [
      generateRequesterInfo(),
      generateRequestContent(),
      addHotizontalBreakLine(),
      generateSuperuserInfo(),
      generateActionButtonsContainer(),
    ],
  });
  return card;

  function addHotizontalBreakLine() {
    return createElementFromMap({
      tagName: 'hr',
      class: 'horizontal__line__saperator',
    });
  }

  function generateActionButtonsContainer() {
    return createElementFromMap({
      tagName: 'div',
      class: ['action__container', showActionButtonClass],
      child: [
        createElementFromMap({
          tagName: 'input',
          class: 'request__remark__input',
          id: `remark-text-${id}`,
          type: 'text',
          placeholder: 'Add Remark If Any...',
        }),
        createElementFromMap({
          tagName: 'div',
          class: ['action__buttons__container'],
          child: [
            createElementFromMap({
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
            createElementFromMap({
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
    });
  }

  function generateSuperuserInfo() {
    return createElementFromMap({
      tagName: 'div',
      class: ['admin__info__and__status', showSuperuserDetailsClass],
      child: [
        createElementFromMap({
          tagName: 'div',
          class: 'admin__info',
          child: [
            createElementFromMap({
              tagName: 'div',
              class: 'admin__card__footer__requestor__avatar',
              child: [
                createElementFromMap({
                  tagName: 'img',
                  src:
                    superUserDetails?.picture?.url ||
                    'https://dashboard.realdevsquad.com/images/avatar.png',
                }),
              ],
            }),
            createElementFromMap({
              tagName: 'div',
              class: 'admin__name__and__remark',
              child: [
                createElementFromMap({
                  tagName: 'div',
                  class: 'admin__name',
                  child: [
                    createElementFromMap({
                      tagName: 'h4',
                      textContent: getFullNameOfUser(superUserDetails) || 'N/A',
                    }),
                    createElementFromMap({
                      tagName: 'p',
                      textContent: updatedDateInAgoFormat || 'N/A',
                      class: 'tooltip-container',
                      child: [
                        createElementFromMap({
                          tagName: 'span',
                          class: 'tooltip',
                          textContent: updatedDate,
                        }),
                      ],
                    }),
                  ],
                }),
                createElementFromMap({
                  tagName: 'p',
                  textContent: reason || '',
                }),
              ],
            }),
          ],
        }),
      ],
    });
  }

  function generateRequestContent() {
    return createElementFromMap({
      tagName: 'div',
      class: 'request__content',
      child: [
        createElementFromMap({
          tagName: 'p',
          textContent: message || 'N/A',
        }),
        createElementFromMap({
          tagName: 'div',
          class: 'request__timeline',
          child: [
            createElementFromMap({
              tagName: 'p',
              child: [
                createElementFromMap({
                  tagName: 'span',
                  class: 'request__date__pill',
                  textContent: 'From',
                }),
                ` ${fromDate}` || 'N/A',
              ],
            }),
            createElementFromMap({
              tagName: 'p',
              child: [
                createElementFromMap({
                  tagName: 'span',
                  class: 'request__date__pill',
                  textContent: 'To',
                }),
                ` ${toDate}` || 'N/A',
              ],
            }),
          ],
        }),
      ],
    });
  }

  function generateRequesterInfo() {
    return createElementFromMap({
      tagName: 'div',
      class: 'requester__info__and__status',
      child: [
        createElementFromMap({
          tagName: 'div',
          class: 'requester__info',
          child: [
            createElementFromMap({
              tagName: 'div',
              class: 'request__card__footer__requestor__avatar',
              child: [
                createElementFromMap({
                  tagName: 'img',
                  src:
                    requesterUserDetails?.picture?.url ||
                    'https://dashboard.realdevsquad.com/images/avatar.png',
                }),
              ],
            }),
            createElementFromMap({
              tagName: 'div',
              class: 'requester__name',
              child: [
                createElementFromMap({
                  tagName: 'h4',
                  textContent: getFullNameOfUser(requesterUserDetails) || 'N/A',
                }),
                createElementFromMap({
                  tagName: 'p',
                  textContent: createdDateInAgoFormat || 'N/A',
                  class: 'tooltip-container',
                  child: [
                    createElementFromMap({
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
        createElementFromMap({
          tagName: 'button',
          class: ['request__status', `request__status--${state.toLowerCase()}`],
          textContent:
            state.charAt(0).toUpperCase() + state.slice(1).toLowerCase() ||
            'N/A',
        }),
      ],
    });
  }
}

async function renderOooRequestCards(queries = {}) {
  if (isDataLoading) return;
  let oooRequestResponse;
  try {
    isDataLoading = true;
    startLoading();
    if (userDetails.length === 0) {
      userDetails = await getInDiscordUserList();
    }
    oooRequestResponse = await getOooRequests(queries);
    for (const oooRequest of oooRequestResponse?.data || []) {
      let superUserDetails;
      let requesterUserDetails = await getUserDetails(oooRequest.requestedBy);
      if (oooRequest.state !== 'PENDING') {
        superUserDetails = await getUserDetails(oooRequest.lastModifiedBy);
      }
      requestContainer.appendChild(
        createOooRequestCard(
          oooRequest,
          superUserDetails,
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
      requestContainer.innerHTML === '' ||
      oooRequestResponse === undefined ||
      oooRequestResponse?.data?.length === 0
    ) {
      showMessage('INFO', 'No OOO requests found!');
    }
  }

  addIntersectionObserver();
  nextLink = oooRequestResponse?.next;
}

async function acceptRejectRequest(id, reqBody) {
  let url = `${API_BASE_URL}/requests/${id}?dev=true`;
  try {
    const res = await fetch(url, {
      credentials: 'include',
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
      },
      body: reqBody,
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Status updated successfully!', 'success');
      return data;
    } else {
      switch (res.status) {
        case 401:
          showToast(ErrorMessages.UNAUTHENTICATED, 'failure');
          showMessage('ERROR', ErrorMessages.UNAUTHENTICATED);
          break;
        case 403:
          showToast(ErrorMessages.UNAUTHENTICATED, 'failure');
          showMessage('ERROR', ErrorMessages.UNAUTHORIZED);
          break;
        case 404:
          showToast(ErrorMessages.OOO_NOT_FOUND, 'failure');
          showMessage('ERROR', ErrorMessages.OOO_NOT_FOUND);
          break;
        case 400:
          showToast(data.message, 'failure');
          showMessage('ERROR', data.message);
          break;
        default:
          break;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

async function performAcceptRejectAction(isAccepted, e) {
  e.preventDefault();
  const requestId = e.target.id;
  let remark = document.getElementById(`remark-text-${requestId}`).value;
  let body = JSON.stringify({
    type: currentReqType,
    reason: remark,
    state: isAccepted ? 'APPROVED' : 'REJECTED',
  });
  if (remark === '' || remark === undefined || remark === null) {
    body = JSON.stringify({
      type: currentReqType,
      state: isAccepted ? 'APPROVED' : 'REJECTED',
    });
  }
  const parentDiv = e.target.closest('.ooo_request__card');
  parentDiv.classList.add('disabled');
  const removeSpinner = addSpinner(parentDiv);

  const response = await acceptRejectRequest(requestId, body);
  removeSpinner();
  parentDiv.classList.remove('disabled');

  if (response) {
    try {
      const updatedRequestDetails = (await getRequestDetailsById(requestId))
        .data[0];
      const superUserDetails = await getUserDetails(
        updatedRequestDetails.lastModifiedBy,
      );
      const requesterUserDetails = await getUserDetails(
        updatedRequestDetails.requestedBy,
      );

      const updatedCard = createOooRequestCard(
        updatedRequestDetails,
        superUserDetails,
        requesterUserDetails,
      );
      parentDiv.replaceWith(updatedCard);
    } catch (error) {
      console.log(error);
      showMessage('ERROR', ErrorMessages.SERVER_ERROR);
    }
  }
}

function showToast(message, type) {
  if (typeof message === 'string') {
    toast.innerHTML = `<div class="message">${message}</div>`;
  }
  toast.classList.remove('hidden');

  if (type === 'success') {
    toast.classList.add('success');
    toast.classList.remove('failure');
  } else if (type === 'failure') {
    toast.classList.add('failure');
    toast.classList.remove('success');
  }

  const progressBar = document.createElement('div');
  progressBar.classList.add('progress-bar');
  progressBar.classList.add('fill');
  toast.appendChild(progressBar);

  setTimeout(() => {
    toast.classList.add('hidden');
    toast.innerHTML = '';
  }, 5000);
}

renderOooRequestCards({ state: statusValue, sort: sortByValue });
