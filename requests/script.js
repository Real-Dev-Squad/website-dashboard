const API_BASE_URL = window.API_BASE_URL;
const requestContainer = document.getElementById(REQUEST_CONTAINER_ID);
const lastElementContainer = document.querySelector(LAST_ELEMENT_CONTAINER);
const params = new URLSearchParams(window.location.search);
const loader = document.querySelector('.container__body__loader');
const startLoading = () => loader.classList.remove('hidden');
const stopLoading = () => loader.classList.add('hidden');
let oooTabLink = document.getElementById(OOO_TAB_ID);
let extensionTabLink = document.getElementById(EXTENSION_TAB_ID);
let onboardingExtensionTabLink = document.getElementById(
  ONBOARDING_EXTENSION_TAB_ID,
);
const filterContainer = document.getElementById('filterContainer');
const filterButton = document.getElementById('filterButton');
const filterComponent = document.getElementById('filterComponent');
const activeFilterTags = document.getElementById('active-filter-tags');
const filterModal = document.getElementById('filterModal');
const filterOptionsContainer = document.getElementById(
  'filterOptionsContainer',
);
const isDev = params.get('dev') === 'true';
const applyFilterButton = document.getElementById('applyFilterButton');
const userNameFilterInput = document.getElementById('assignee-search-input');
let currentReqType = params.get('type')?.toUpperCase() ?? OOO_REQUEST_TYPE;
let requestState = params.get('status')?.toUpperCase() ?? null;
let selected__tab__class = 'selected__tab';
let statusValue = null;
let sortByValue = null;
let userDetails = [];
let nextLink = '';
let isDataLoading = false;

let currentUserDetails;

getSelfUser()
  .then((response) => {
    currentUserDetails = response;
  })
  .catch((error) => {
    currentUserDetails = null;
    showMessage('ERROR', ErrorMessages.UNAUTHENTICATED);
  });

function updateTabLink(requestType) {
  if (requestType === OOO_REQUEST_TYPE) {
    oooTabLink.classList.add(selected__tab__class);
    onboardingExtensionTabLink.classList.remove(selected__tab__class);
    extensionTabLink.classList.remove(selected__tab__class);
  } else if (requestType === ONBOARDING_EXTENSION_REQUEST_TYPE) {
    onboardingExtensionTabLink.classList.add(selected__tab__class);
    oooTabLink.classList.remove(selected__tab__class);
    extensionTabLink.classList.remove(selected__tab__class);
  } else if (requestType === EXTENSION_REQUEST_TYPE) {
    extensionTabLink.classList.add(selected__tab__class);
    oooTabLink.classList.remove(selected__tab__class);
    onboardingExtensionTabLink.classList.remove(selected__tab__class);
  }
}

if (isDev) {
  activeFilterTags.classList.remove('hidden');
  filterComponent.classList.remove('hidden');
  filterButton.classList.add('hidden');
}

function getUserDetails(id) {
  return userDetails.find((user) => user.id === id);
}

const intersectionObserver = new IntersectionObserver(async (entries) => {
  if (!nextLink) {
    return;
  }
  if (entries[0].isIntersecting && !isDataLoading) {
    await renderRequestCards({
      state: statusValue,
      sort: sortByValue,
      next: nextLink,
      requestType: currentReqType,
    });
  }
});

const addIntersectionObserver = () => {
  intersectionObserver.observe(lastElementContainer);
};
const removeIntersectionObserver = () => {
  intersectionObserver.unobserve(lastElementContainer);
};

oooTabLink.addEventListener('click', async function (event) {
  event.preventDefault();
  if (isDataLoading) return;
  currentReqType = OOO_REQUEST_TYPE;
  nextLink = '';
  deselectRadioButtons();
  userNameFilterInput.value = '';
  updateTabLink(currentReqType);
  changeFilter();
  updateUrlWithQuery(currentReqType);
  await renderRequestCards({
    state: statusValue,
    sort: sortByValue,
    requestType: currentReqType,
  });
});

extensionTabLink.addEventListener('click', async function (event) {
  event.preventDefault();
  if (isDataLoading) return;
  currentReqType = EXTENSION_REQUEST_TYPE;
  nextLink = '';
  deselectRadioButtons();
  userNameFilterInput.value = '';
  updateTabLink(currentReqType);
  changeFilter();
  updateUrlWithQuery(currentReqType);
  await renderRequestCards({
    state: statusValue,
    sort: sortByValue,
    requestType: currentReqType,
  });
});

onboardingExtensionTabLink.addEventListener('click', async function (event) {
  event.preventDefault();
  if (isDataLoading) return;
  currentReqType = ONBOARDING_EXTENSION_REQUEST_TYPE;
  nextLink = '';
  deselectRadioButtons();
  userNameFilterInput.value = '';
  updateTabLink(currentReqType);
  changeFilter();
  updateUrlWithQuery(currentReqType);
  await renderRequestCards({
    state: statusValue,
    sort: sortByValue,
    requestType: currentReqType,
  });
});

function updateUrlWithQuery(type) {
  const url = new URL(window.location);
  url.searchParams.set('type', type.toLowerCase());
  window.history.pushState({ path: url.toString() }, '', url.toString());
}

async function getRequests(requestType, query = {}) {
  let finalUrl =
    API_BASE_URL +
    (nextLink || `/requests${getQueryParamsString(requestType, query)}`);

  if (query?.state?.[0] || query?.requestedBy) {
    finalUrl =
      API_BASE_URL + `/requests${getQueryParamsString(requestType, query)}`;
  }
  const notFoundErrorMessage =
    requestType === ONBOARDING_EXTENSION_REQUEST_TYPE
      ? ErrorMessages.ONBOARDING_EXTENSION_NOT_FOUND
      : ErrorMessages.OOO_NOT_FOUND;
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
          showMessage('ERROR', notFoundErrorMessage);
          return;
        case 400:
          showMessage('ERROR', data.message);
          showToastMessage({
            isDev,
            oldToastFunction: showToast,
            type: 'failure',
            message: data.message,
          });

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

function createRequestCard(request, superUserDetails, requesterUserDetails) {
  let {
    id,
    state,
    from,
    until,
    type,
    newEndsOn,
    oldEndsOn,
    message,
    createdAt,
    lastModifiedBy,
    reason,
    updatedAt,
  } = request;
  let showSuperuserDetailsClass = 'notHidden';
  let showActionButtonClass = 'notHidden';
  const isRequestTypeOnboarding = type === ONBOARDING_EXTENSION_REQUEST_TYPE;
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
  const fromDate = convertDateToReadableStringDate(
    isRequestTypeOnboarding ? oldEndsOn : from,
    DEFAULT_DATE_FORMAT,
  );
  const toDate = convertDateToReadableStringDate(
    isRequestTypeOnboarding ? newEndsOn : until,
    DEFAULT_DATE_FORMAT,
  );
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
    class: 'request__card',
    testId: `${type.toLowerCase()}-request-card`,
    child: [
      generateRequesterInfo(),
      generateRequestContent(),
      generateSuperuserInfo(),
      generateActionButtonsContainer(),
    ],
  });
  return card;

  function generateActionButtonsContainer() {
    return createElementFromMap({
      tagName: 'div',
      class: ['action__container', showActionButtonClass],
      testId: 'action-container',
      child: [
        createElementFromMap({
          tagName: 'input',
          class: 'request__remark__input',
          testId: 'request-remark-input',
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
              testId: 'approve-button',
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
              testId: 'reject-button',
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
      testId: 'admin-info-and-status',
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
                  textContent: type === 'ONBOARDING' ? message : reason || '',
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
          textContent:
            'Reason: ' + (type === 'ONBOARDING' ? reason : message || 'N/A'),
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
                  textContent: 'From:',
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
                  textContent: 'To:',
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
          testId: 'request-status',
          textContent:
            state.charAt(0).toUpperCase() + state.slice(1).toLowerCase() ||
            'N/A',
        }),
      ],
    });
  }
}

async function renderRequestCards(queries = {}) {
  if (isDataLoading) return;
  let requestResponse;
  try {
    isDataLoading = true;
    startLoading();
    if (userDetails.length === 0) {
      userDetails = await getInDiscordUserList();
    }
    requestResponse = await getRequests(queries?.requestType, queries);

    for (const request of requestResponse?.data || []) {
      let superUserDetails;
      let requesterUserDetails = await getUserDetails(
        request.type === 'OOO' ? request.requestedBy : request.userId,
      );
      if (request.state !== 'PENDING') {
        superUserDetails = await getUserDetails(request.lastModifiedBy);
      }
      if (isDev) {
        createRequestCardComponent({
          data: request,
          isExtensionRequest: false,
          parentContainer: requestContainer,
          currentUser: currentUserDetails,
          requestUser: requesterUserDetails,
        });
      } else {
        requestContainer.appendChild(
          createRequestCard(request, superUserDetails, requesterUserDetails),
        );
      }
    }
  } catch (error) {
    console.error(error);
    showMessage('ERROR', ErrorMessages.SERVER_ERROR);
  } finally {
    stopLoading();
    isDataLoading = false;
    if (
      requestContainer.innerHTML === '' ||
      requestResponse === undefined ||
      requestResponse?.data?.length === 0
    ) {
      showMessage('INFO', `No ${currentReqType.toLowerCase()} requests found!`);
    }
  }

  addIntersectionObserver();
  nextLink = requestResponse?.next;
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
      showToastMessage({
        isDev,
        oldToastFunction: showToast,
        type: 'success',
        message: data.message,
      });

      return data;
    } else {
      switch (res.status) {
        case 401:
          showToastMessage({
            isDev,
            oldToastFunction: showToast,
            type: 'failure',
            message: ErrorMessages.UNAUTHORIZED_ACTION,
          });
          showMessage('ERROR', ErrorMessages.UNAUTHORIZED_ACTION);
          break;
        case 403:
          showToastMessage({
            isDev,
            oldToastFunction: showToast,
            type: 'failure',
            message: ErrorMessages.UNAUTHENTICATED,
          });
          break;
        case 404:
          showToastMessage({
            isDev,
            oldToastFunction: showToast,
            type: 'failure',
            message: ErrorMessages.OOO_NOT_FOUND,
          });
          break;
        case 400:
          showToastMessage({
            isDev,
            oldToastFunction: showToast,
            type: 'failure',
            message: data.message,
          });
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
    message: remark,
    state: isAccepted ? 'APPROVED' : 'REJECTED',
  });
  if (remark === '' || remark === undefined || remark === null) {
    body = JSON.stringify({
      type: currentReqType,
      state: isAccepted ? 'APPROVED' : 'REJECTED',
    });
  }

  const parentDiv = e.target.closest('.request__card');
  parentDiv.classList.add('disabled');
  const removeSpinner = addSpinner(parentDiv);

  const response = await acceptRejectRequest(requestId, body);
  removeSpinner();
  parentDiv.classList.remove('disabled');

  if (response) {
    try {
      const updatedRequestDetails = (await getRequestDetailsById(requestId))
        .data;

      const superUserDetails = await getUserDetails(
        updatedRequestDetails.lastModifiedBy,
      );
      const requesterUserDetails = await getUserDetails(
        updatedRequestDetails.type === 'OOO'
          ? updatedRequestDetails.requestedBy
          : updatedRequestDetails.userId,
      );

      const updatedCard = createRequestCard(
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

  nextLink = '';
  await renderRequestCards({
    state: statusValue,
    sort: sortByValue,
    requestType: currentReqType,
  });
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

function toggleFilter() {
  filterModal.classList.toggle('hidden');
}

document.addEventListener('click', (event) => {
  if (
    !filterModal.classList.contains('hidden') &&
    !filterModal.contains(event.target) &&
    event.target !== filterButton
  ) {
    closeFilter();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !filterModal.classList.contains('hidden')) {
    closeFilter();
  }
});

function closeFilter() {
  filterModal.classList.add('hidden');
}

filterButton.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleFilter();
});

applyFilterButton.addEventListener('click', async (event) => {
  closeFilter();

  const requestData = {
    state: getCheckedValues() || statusValue,
    sort: sortByValue,
    requestType: currentReqType,
  };

  const username = userNameFilterInput.value.trim();
  if (username) {
    requestData.requestedBy = username;
  }

  requestContainer.innerHTML = '';
  await renderRequestCards(requestData);
});

userNameFilterInput.addEventListener(
  'input',
  debounce(async function (event) {
    const username = event.target.value.trim();
    const suggestionContainer = document.getElementById('userSuggestionsList');

    if (username.length > 2) {
      const users = await getUsersByUsername(username);

      suggestionContainer.classList.remove('hidden');
      while (suggestionContainer.firstChild) {
        suggestionContainer.removeChild(suggestionContainer.firstChild);
      }

      if (users && users.length > 0) {
        const fragment = document.createDocumentFragment();

        users.forEach((user) => {
          const userDiv = document.createElement('div');
          userDiv.className = 'suggestion';
          userDiv.textContent = user.username;

          userDiv.addEventListener('click', async () => {
            userNameFilterInput.value = user.username;
            suggestionContainer.classList.add('hidden');
            requestContainer.innerHTML = '';

            const requestData = {
              requestedBy: user?.username,
              requestType: currentReqType,
            };
            await renderRequestCards(requestData);
          });

          fragment.appendChild(userDiv);
        });

        suggestionContainer.appendChild(fragment);
      }
    } else {
      suggestionContainer.classList.add('hidden');
      while (suggestionContainer.firstChild) {
        suggestionContainer.removeChild(suggestionContainer.firstChild);
      }
    }
  }, 300),
);

userNameFilterInput.addEventListener('keydown', async function (evt) {
  if (evt.key === 'Enter') {
    const username = this.value.trim();
    const values = getCheckedValues();

    const requestData = {
      state: statusValue,
      sort: sortByValue,
      requestType: currentReqType,
    };

    if (values.length > 0) {
      requestData.state = values;
    }

    if (username) {
      requestData.requestedBy = username;
    }

    requestContainer.innerHTML = '';
    await renderRequestCards(requestData);
  }
});

function getCheckedValues() {
  const checkboxes = document.querySelectorAll(`input:checked`);
  return Array.from(checkboxes).map((cb) => cb.value);
}

function populateStatus() {
  const statusList = [
    { name: 'Approved', id: 'APPROVED' },
    { name: 'Pending', id: 'PENDING' },
    { name: 'Rejected', id: 'REJECTED' },
  ];
  const filterHeader = document.createElement('div');
  filterHeader.className = 'filter__header';

  const filterTitle = document.createElement('p');
  filterTitle.className = 'filter__title';
  filterTitle.textContent = 'Filter By Status';

  const clearButton = document.createElement('button');
  clearButton.className = 'filter__clear__button';
  clearButton.textContent = 'Clear';
  clearButton.setAttribute('data-testid', 'filter-clear-button');

  filterHeader.append(filterTitle);

  clearButton.addEventListener('click', async function () {
    filterModal.classList.add('hidden');
    deselectRadioButtons();
    requestContainer.innerHTML = '';
    await renderRequestCards({
      state: statusValue,
      sort: sortByValue,
      requestType: currentReqType,
    });
  });

  filterTitle.appendChild(clearButton);
  document.querySelector('#filterOptionsContainer').prepend(filterHeader);

  for (const { name, id } of statusList) {
    addRadioButton(name, id, 'status-filter');
  }
}
updateTabLink(currentReqType);
if (isDev) {
  const statusList = [
    { name: 'Approved', id: 'APPROVED' },
    { name: 'Pending', id: 'PENDING' },
    { name: 'Rejected', id: 'REJECTED' },
  ];
  document.addEventListener('DOMContentLoaded', () => {
    renderFilterComponent({
      filterComponent,
      page: 'requests',
      statusList,
      parentContainer: requestContainer,
      shouldAllowMultipleSelection: false,
      renderFunction: renderRequestCards,
      otherFilters: {
        sortByValue,
      },
    });
  });
  renderRequestCards({
    state: requestState ?? statusValue,
    sort: sortByValue,
    requestType: currentReqType,
  });
} else {
  populateStatus();
  renderRequestCards({
    state: statusValue,
    sort: sortByValue,
    requestType: currentReqType,
  });
}
