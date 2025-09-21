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

      createRequestCardComponent({
        data: request,
        isExtensionRequest: false,
        parentContainer: requestContainer,
        currentUser: currentUserDetails,
        requestUser: requesterUserDetails,
      });
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
