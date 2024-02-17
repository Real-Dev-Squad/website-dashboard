const API_BASE_URL = window.API_BASE_URL;
const oooRequestContainer = document.getElementById('ooo-request-container');
const filterModal = document.getElementsByClassName(FILTER_MODAL)[0];
const applyFilterButton = document.getElementById(APPLY_FILTER_BUTTON);
const clearButton = document.getElementById(CLEAR_BUTTON);
const filterButton = document.getElementById(FILTER_BUTTON);
const sortModal = document.getElementsByClassName(SORT_MODAL)[0];
const containerFilter = document.querySelector(FILTER_CONTAINER);
const lastElementContainer = document.querySelector(LAST_ELEMENT_CONTAINER);
const sortButton = document.querySelector(SORT_BUTTON);
const backDrop = document.querySelector(BACKDROP);
const params = new URLSearchParams(window.location.search);
const isDev = params.get(DEV_FEATURE_FLAG) === 'true';
const loader = document.querySelector('.container__body__loader');
const startLoading = () => loader.classList.remove('hidden');
const stopLoading = () => loader.classList.add('hidden');
let pageVersion = 0;
let nextLink = '';
let isDataLoading = false;
let selectedSortButton = null;

const filterStates = {
  status: Status.PENDING,
  order: CREATED_TIME,
  size: DEFAULT_PAGE_SIZE,
};

const updateFilterStates = (key, value) => {
  filterStates[key] = value;
};

async function getOooRequests(query = {}, nextLink) {
  let finalUrl = API_BASE_URL + (nextLink || '/requests' + getQueryParamsString(query));
  if(isDev){
    finalUrl = API_BASE_URL + (nextLink || '/requests?dev=true' + getQueryParamsString(query));
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
  nextLink = '';
  oooRequestContainer.innerHTML = '';
};

sortButton.addEventListener('click', async (event) => {
  event.stopPropagation();
  sortModal.classList.toggle('hidden');
  backDrop.style.display = 'flex';
});

backDrop.addEventListener('click', () => {
  sortModal.classList.add('hidden');
  filterModal.classList.add('hidden');
  backDrop.style.display = 'none';
});

function toggleStatusCheckbox(statusValue) {
  const element = document.querySelector(
    `#status-filter input[value=${statusValue}]`,
  );
  element.checked = !element.checked;
}
function clearCheckboxes(groupName) {
  const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
  checkboxes.forEach((cb) => {
    cb.checked = false;
  });
}
function getCheckedValues(groupName) {
  const checkboxes = document.querySelectorAll(
    `input[name="${groupName}"]:checked`,
  );
  return Array.from(checkboxes).map((cb) => cb.value.toLowerCase());
}

filterButton.addEventListener('click', (event) => {
  filterModal.classList.toggle('hidden');
  backDrop.style.display = 'flex';
});

applyFilterButton.addEventListener('click', async () => {
  filterModal.classList.toggle('hidden');
  const checkedValuesStatus = getCheckedValues('status-filter');
  changeFilter();
  if (checkedValuesStatus) {
    updateFilterStates('status', checkedValuesStatus);
  }
  await renderOooRequestCards(filterStates);
});
clearButton.addEventListener('click', async function () {
  clearCheckboxes('status-filter');
  filterModal.classList.toggle('hidden');
  changeFilter();
  updateFilterStates('status', '');
  await renderOooRequestCards(filterStates);
});

function addCheckbox(labelText, value, groupName) {
  const group = document.getElementById(groupName);
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = groupName;
  checkbox.value = value;
  label.innerHTML = checkbox.outerHTML + '&nbsp;' + labelText;
  label.classList.add('checkbox-label');
  label.appendChild(document.createElement('br'));
  group.appendChild(label);
}
function addSortByIcon(name, id, groupName, order) {
  const group = document.getElementById(groupName);

  const containerAsc = createSortContainer(id, name, order);
  group.appendChild(containerAsc);
}

function sortModalButtons() {
  const assigneeAsc = document.getElementById(ASSIGNEE_COUNT);
  const assigneeDesc = document.getElementById(ASSIGNEE_DESC);
  const createTimeAsc = document.getElementById(CREATED_TIME);
  const createTimeDesc = document.getElementById(CREATED_TIME_DESC);

  const sortModalButtons = [
    assigneeAsc,
    assigneeDesc,
    createTimeAsc,
    createTimeDesc,
  ];

  function toggleSortModal() {
    sortModal.classList.toggle('hidden');
    backDrop.style.display = 'none';
  }

  function selectButton(button) {
    if (selectedSortButton === button) {
      selectedSortButton.classList.remove('selected');
      selectedSortButton = null;
      toggleSortModal();
    } else {
      if (selectedSortButton) {
        selectedSortButton.classList.remove('selected');
      }
      selectedSortButton = button;
      selectedSortButton.classList.add('selected');
      toggleSortModal();
    }
  }

  sortModalButtons.forEach((button) => {
    if (button) {
      button.addEventListener('click', async () => {
        selectButton(button);
        changeFilter();
        updateFilterStates('order', button.id);
        await renderOooRequestCards(filterStates);
      });
    }
  });
  selectButton(createTimeAsc);
  toggleSortModal();
}

function createSortContainer(id, name, sortOrder) {
  const container = document.createElement('div');
  container.classList.add('sort-container', sortOrder);

  container.id = id;

  const nameSpan = document.createElement('span');
  nameSpan.classList.add('sort__button__text');
  nameSpan.textContent = name;
  const label = document.createElement('label');
  label.appendChild(nameSpan);

  label.classList.add('sort-label');

  container.appendChild(label);

  return container;
}

function populateStatus() {
  const statusList = [
    { name: 'Approved', id: 'APPROVED' },
    { name: 'Pending', id: 'PENDING' },
    { name: 'Denied', id: 'DENIED' },
  ];

  statusList.map(({ name, id }) => addCheckbox(name, id, 'status-filter'));

  const sortByList = [
    {
      name: 'Newest First',
      id: 'CREATED_TIME_DESC',
      order: 'desc',
    },
    {
      name: 'Oldest First',
      id: 'CREATED_TIME_ASC',
      order: 'asc',
    },
  ];

  sortByList.forEach(({ name, id, order }) =>
    addSortByIcon(name, id, 'sort_by-filter', order),
  );
}

populateStatus();
sortModalButtons();

function createTaskRequestCard(taskRequest,adminUserDetails,requesterUserDetails) {
  let { id,state,from,until,message,createdAt,lastModifiedBy,reason,updatedAt} = taskRequest;
  let showAdminDetailsClass = "notHidden";
  let showActionButtonClass = "notHidden";
  if(state === "PENDING" || lastModifiedBy === undefined || lastModifiedBy === null){
    showAdminDetailsClass = "hidden";
  }
  if(state !== "PENDING"){
    showActionButtonClass = "hidden";
  }
  const createdDate = convertDateToReadableStringDate(createdAt);
  const createdDateInAgoFormat = dateDiff(Date.now(),createdAt,(s) => s + ' ago',);
  const fromDate = convertDateToReadableStringDate(from);
  const toDate = convertDateToReadableStringDate(until);
  let updatedDate = convertDateToReadableStringDate(updatedAt);
  const updatedDateInAgoFormat = dateDiff(Date.now(),updatedAt,(s) => s + ' ago',);

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
                    src: requesterUserDetails?.picture?.url||'https://dashboard.realdevsquad.com/images/avatar.png',
                  }),
                ],
              }),
              createCustomElement({
                tagName: 'div',
                class: 'requester__name',
                child: [
                  createCustomElement({
                    tagName: 'h4',
                    textContent: getFullNameOfUser(requesterUserDetails) || "NA",
                  }),
                  createCustomElement({
                    tagName: 'p',
                    textContent: createdDateInAgoFormat || "NA",
                    class: 'tooltip-container',
                    child: [
                      createCustomElement({
                        tagName: 'span',
                        class: 'tooltip',
                        textContent: createdDate
                      }),
                    ],
                  }),
                ],
              }),
            ]
          }),
          createCustomElement({
            tagName: 'button',
            class: ['request__status', `request__status--${state.toLowerCase()}`],
            textContent: state.charAt(0).toUpperCase() + state.slice(1).toLowerCase() || "NA",
          }),
        ],
      }),
      createCustomElement({
        tagName: 'div',
        class: 'request__content',
        child: [
          createCustomElement({
            tagName: 'p',
            textContent: message || "NA",
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
                  ` ${fromDate}` || "NA",
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
                  ` ${toDate}` || "NA",
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
                    src: adminUserDetails?.picture?.url || 'https://dashboard.realdevsquad.com/images/avatar.png',
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
                        textContent: getFullNameOfUser(adminUserDetails) || "NA",
                      }),
                      createCustomElement({
                        tagName: 'p',
                        textContent: updatedDateInAgoFormat || "NA",
                        class: 'tooltip-container',
                        child: [
                          createCustomElement({
                            tagName: 'span',
                            class: 'tooltip',
                            textContent: updatedDate
                          }),
                        ],
                      }),
                    ],
                  }),
                  createCustomElement({
                    tagName: 'p',
                    textContent: reason || "No Remark Provided!",
                  }),
                ],
              }),
            ]
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
            type: "text",
            placeholder: "Add Remark If Any..."
          }),
          createCustomElement({
            tagName: 'div',
            class: ['action__buttons__container'],
            child: [
              createCustomElement(
              {
                tagName: 'button',
                class: ['request__action__btn','accept__btn'],
                id: `${id}`,
                textContent: "Accept",
                eventListeners: [{ event: 'click', func: (e) => performAcceptRejectAction(true,e) }],
              }),
              createCustomElement(
                {
                  tagName: 'button',
                  class: ['request__action__btn','reject__btn'],
                  id: `${id}`,
                  textContent: "Reject",
                  eventListeners: [{ event: 'click', func: (e) => performAcceptRejectAction(false,e) }],
                }),
            ],
          })
        ]
      }),
    ],
  });
  return card;
}

const intersectionObserver = new IntersectionObserver(async (entries) => {
  if (!nextLink) {
    return;
  }
  if (entries[0].isIntersecting && !isDataLoading) {
    await renderOooRequestCards({}, nextLink);
  }
});

const addIntersectionObserver = () => {
  intersectionObserver.observe(lastElementContainer);
};
const removeIntersectionObserver = () => {
  intersectionObserver.unobserve(lastElementContainer);
};

async function renderOooRequestCards(queries = {}, newLink = '') {
  pageVersion++;
  const currentVersion = pageVersion;
  let  oooRequestResponse;
  try {
    isDataLoading = true;
    startLoading();
    oooRequestResponse = await getOooRequests(queries, newLink);
    if (currentVersion !== pageVersion) {
      return;
    }
    for (const oooRequest of oooRequestResponse?.data || []) {
      let adminUserDetails;
      let requesterUserDetails = await getUserDetails(oooRequest.requestedBy);
      if(oooRequest.state !== "PENDING"){
        adminUserDetails = await getUserDetails(oooRequest.lastModifiedBy);
      }
      oooRequestContainer.appendChild(createTaskRequestCard(oooRequest, adminUserDetails, requesterUserDetails));
    }
  } catch (error) {
    console.error(error);
    showMessage('ERROR', ErrorMessages.SERVER_ERROR);
  } finally {
    if (currentVersion !== pageVersion) return;
    stopLoading();
    isDataLoading = false;
    if (oooRequestContainer.innerHTML === '' || oooRequestResponse === undefined || oooRequestResponse?.data?.length === 0) {
      showMessage('INFO', 'No OOO requests found!');
    }
  }
}

async function render() {
  toggleStatusCheckbox(Status.PENDING.toUpperCase());

  await renderOooRequestCards(filterStates);
  addIntersectionObserver();
}

render();

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
  if(isDev){
    url = `${API_BASE_URL}/requests/${id}?dev=true`;
  }
  try{
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


async function performAcceptRejectAction(isAccepted,e) {
  e.preventDefault();
  const requestId = e.target.id;
  let remark = document.getElementById(`remark-text-${requestId}`).value;
  if(remark === undefined || remark === ""){
    remark = null;
  }
  const response = await acceptRejectRequest(isAccepted ? 'APPROVED' : 'REJECTED', requestId, remark);
  console.log(requestId)
  console.log(remark)
  if(response){
    changeFilter();
    await renderOooRequestCards(filterStates);
  }
}