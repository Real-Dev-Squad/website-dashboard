import {
  createElement,
  getApplications,
  getIsSuperUser,
  showToast,
  updateApplication,
  getApplicationById,
} from './utils.js';
let nextLink;
let isDataLoading = false;
const loader = document.querySelector('.loader');
const filterModal = document.querySelector('.filter-modal');
const backDrop = document.querySelector('.backdrop');
const backDropBlur = document.querySelector('.backdrop-blur');
const applicationDetailsModal = document.querySelector('.application-details');
const mainContainer = document.querySelector('.container');
const applicationCloseButton = document.querySelector(
  '.application-close-button',
);
const noApplicationFoundText = document.querySelector('.no_applications_found');
const applicationDetailsMain = document.querySelector(
  '.application-details-main',
);
const applicationAcceptButton = document.querySelector(
  '.application-details-accept',
);
const applicationRejectButton = document.querySelector(
  '.application-details-reject',
);
const applyFilterButton = document.getElementById('apply-filter-button');
const applicationContainer = document.querySelector('.application-container');
const clearButton = document.getElementById('clear-button');
const lastElementContainer = document.getElementById('page_bottom_element');

const applicationDetailsActionsContainer = document.querySelector(
  '.application-details-actions',
);
const urlParams = new URLSearchParams(window.location.search);
const isDev = urlParams.get('dev') === 'true';
const filterButton = isDev
  ? document.getElementById('filter-button-new')
  : document.getElementById('filter-button');
if (isDev)
  document
    .getElementsByClassName('filter-container')[0]
    .classList.remove('hidden');

const filterDropdown = document.querySelector('.filter-dropdown');
const filterOptions = document.querySelectorAll(
  '.filter-dropdown div:not(.close-dropdown-btn)',
);
const filterLabel = document.querySelector('.filter-label');
const filterText = document.querySelector('.filter-label .filter-text');
const filterRemove = document.querySelector('.filter-remove');
const closeDropdownBtn = document.querySelector('.close-dropdown-btn');

let applicationId = urlParams.get('id');

let currentApplicationId;

let status = 'all';

function updateUserApplication({ isAccepted }) {
  const applicationTextarea = document.querySelector('.application-textarea');
  let status;
  const payload = {};

  if (isAccepted) status = 'accepted';
  else status = 'rejected';

  payload['status'] = status;

  if (applicationTextarea.value) {
    payload.feedback = applicationTextarea.value;
  }

  updateApplication({
    applicationId: currentApplicationId,
    applicationPayload: payload,
  })
    .then((res) => {
      const updatedFeedback = payload.feedback || '';
      applicationTextarea.value = updatedFeedback;

      showToast({ type: 'success', message: res.message });
      setTimeout(() => closeApplicationDetails(), 1000);
    })
    .catch((error) => {
      showToast({ type: 'error', message: error.message });
    });
}

function changeFilter() {
  nextLink = '';
  if (!isDev) {
    filterModal.classList.add('hidden');
    backDrop.style.display = 'none';
  } else {
    status = 'all';
  }
  applicationContainer.innerHTML = '';
}

function closeApplicationDetails() {
  applicationDetailsModal.classList.add('hidden');
  backDropBlur.style.display = 'none';
  document.body.style.overflow = 'auto';
  const applicationAcceptedMsg = document.querySelector(
    '.application-details-accepted-msg',
  );
  const applicationRejectedMsg = document.querySelector(
    '.application-details-rejected-msg',
  );
  if (applicationAcceptedMsg) {
    applicationAcceptedMsg.remove();
  }
  if (applicationRejectedMsg) {
    applicationRejectedMsg.remove();
  }
  removeQueryParamInUrl('id');
}

function openApplicationDetails(application) {
  currentApplicationId = application.id;
  applicationDetailsMain.innerHTML = '';
  backDropBlur.style.display = 'flex';
  applicationDetailsModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  const selectedApplication = {
    username: application.biodata.firstName,
    id: application.id,
    applicationDetails: [
      {
        title: 'Status',
        description: application.status,
      },
      {
        title: 'Introduction',
        description: application.intro.introduction,
      },
      {
        title: 'Skills',
        description: application.professional.skills,
      },
      {
        title: 'Found from',
        description: application.foundFrom,
      },
      {
        title: 'Institution',
        description: application.professional.institution,
      },
      {
        title: 'Number of hours committed',
        description: application.intro.numberOfHours,
      },
      {
        title: 'Why RDS',
        description: application.intro.whyRds,
      },
      {
        title: 'Fun fact',
        description: application.intro.funFact,
      },
      {
        title: 'For fun',
        description: application.intro.forFun,
      },
    ],
  };

  const title = createElement({
    type: 'h1',
    attributes: { class: 'title' },
    innerText: `${selectedApplication.username}'s Application`,
  });

  applicationDetailsMain.appendChild(title);

  selectedApplication.applicationDetails.forEach((application) => {
    const applicationSection = createElement({
      type: 'div',
      attributes: { class: 'application-section' },
    });
    const applicationSectionTitle = createElement({
      type: 'h2',
      attributes: { class: 'section-title' },
      innerText: application.title,
    });
    const applicationSectionDescription = createElement({
      type: 'p',
      attributes: { class: 'description' },
      innerText: application.description,
    });

    applicationSection.appendChild(applicationSectionTitle);
    applicationSection.appendChild(applicationSectionDescription);
    applicationDetailsMain.appendChild(applicationSection);
  });

  const applicationSection = createElement({
    type: 'div',
    attributes: { class: 'application-section' },
  });

  const applicationSectionTitle = createElement({
    type: 'h2',
    attributes: { class: 'section-title' },
    innerText: 'Add Feedback',
  });

  const applicationTextArea = createElement({
    type: 'textarea',
    attributes: {
      class: 'application-textarea',
      placeHolder: 'Add Feedback here',
    },
    innerText: application.feedback || '',
  });

  applicationSection.appendChild(applicationSectionTitle);
  applicationSection.appendChild(applicationTextArea);
  applicationDetailsMain.appendChild(applicationSection);

  if (application.status === 'rejected') {
    applicationAcceptButton.classList.add('hidden');
    applicationRejectButton.classList.add('hidden');
    const applicationDetailsRejectedMsg = createElement({
      type: 'p',
      attributes: {
        class: 'application-details-rejected-msg',
      },
      innerText: 'Application is already rejected',
    });
    applicationDetailsActionsContainer.append(applicationDetailsRejectedMsg);
  } else if (application.status === 'accepted') {
    applicationAcceptButton.classList.add('hidden');
    applicationRejectButton.classList.add('hidden');
    const applicationDetailsAcceptedMsg = createElement({
      type: 'p',
      attributes: {
        class: 'application-details-accepted-msg',
      },
      innerText: 'Application was already accepted',
    });
    applicationDetailsActionsContainer.append(applicationDetailsAcceptedMsg);
  } else {
    applicationRejectButton.disabled = false;
    applicationRejectButton.style.cursor = 'pointer';
    applicationRejectButton.classList.remove('disable-button');
    applicationRejectButton.classList.remove('hidden');

    applicationAcceptButton.classList.remove('hidden');
    applicationAcceptButton.disabled = false;
    applicationAcceptButton.style.cursor = 'pointer';
    applicationAcceptButton.classList.remove('disable-button');
  }
}

function clearFilter() {
  if (status === 'all') return;
  removeQueryParamInUrl('status');
  changeFilter();
  const selectedFilterOption = document.querySelector(
    'input[name="status"]:checked',
  );
  selectedFilterOption.checked = false;
  status = 'all';
  renderApplicationCards(nextLink, status);
}

function changeLoaderVisibility({ hide }) {
  if (hide) loader.classList.add('hidden');
  else loader.classList.remove('hidden');
}

function addQueryParamInUrl(queryParamKey, queryParamVal) {
  const currentUrlParams = new URLSearchParams(window.location.search);
  if (currentUrlParams.has(queryParamKey)) {
    currentUrlParams.delete(queryParamKey);
  }
  currentUrlParams.append(queryParamKey, queryParamVal);
  const updatedUrl = '/applications/?' + currentUrlParams.toString();
  window.history.replaceState(window.history.state, '', updatedUrl);
}

function removeQueryParamInUrl(queryParamKey) {
  const currentUrlParams = new URLSearchParams(window.location.search);
  currentUrlParams.delete(queryParamKey);
  let updatedUrl = '/applications/';
  if (currentUrlParams.size > 0) {
    updatedUrl += '?' + currentUrlParams.toString();
  }
  window.history.replaceState(window.history.state, '', updatedUrl);
}

function createApplicationCard({ application }) {
  const applicationCard = createElement({
    type: 'div',
    attributes: { class: 'application-card' },
  });

  const userInfoContainer = createElement({
    type: 'div',
    attributes: { class: 'user-info' },
  });

  const usernameText = createElement({
    type: 'p',
    attributes: { class: 'username' },
    innerText: application.biodata.firstName,
  });

  const companyNameText = createElement({
    type: 'p',
    attributes: { class: 'company-name hide-overflow' },
    innerText: `Company name: ${application.professional.institution}`,
  });

  const skillsText = createElement({
    type: 'p',
    attributes: { class: 'skills hide-overflow' },
    innerText: `Skills: ${application.professional.skills}`,
  });

  userInfoContainer.appendChild(usernameText);
  userInfoContainer.appendChild(companyNameText);
  userInfoContainer.appendChild(skillsText);

  const introductionText = createElement({
    type: 'p',
    attributes: { class: 'user-intro hide-overflow' },
    innerText: application.intro.introduction.slice(0, 200),
  });

  const viewDetailsButton = createElement({
    type: 'button',
    attributes: { class: 'view-details-button' },
    innerText: 'View Details',
  });

  viewDetailsButton.addEventListener('click', () => {
    addQueryParamInUrl('id', application.id);
    openApplicationDetails(application);
  });

  applicationCard.appendChild(userInfoContainer);
  applicationCard.appendChild(introductionText);
  applicationCard.appendChild(viewDetailsButton);

  return applicationCard;
}

async function renderApplicationCards(next, status, isInitialRender) {
  noApplicationFoundText.classList.add('hidden');
  changeLoaderVisibility({ hide: false });
  isDataLoading = true;
  const data = await getApplications({
    applicationStatus: status,
    next,
  });
  isDataLoading = false;
  changeLoaderVisibility({ hide: true });
  const applications = data.applications;
  nextLink = data.next;
  if (isDev && status != 'all') {
    showAppliedFilter(status);
  }
  if (isInitialRender) filterButton.classList.remove('hidden');
  if (!applications.length)
    return noApplicationFoundText.classList.remove('hidden');
  applications.forEach((application) => {
    const applicationCard = createApplicationCard({
      application,
    });
    applicationContainer.appendChild(applicationCard);
  });
}

async function renderApplicationById(id) {
  noApplicationFoundText.classList.add('hidden');
  changeLoaderVisibility({ hide: false });
  isDataLoading = true;

  try {
    const application = await getApplicationById(id);

    if (!application) {
      return noApplicationFoundText.classList.remove('hidden');
    }
    openApplicationDetails(application);
  } catch (error) {
    console.error('Error fetching application by user ID:', error);
    noApplicationFoundText.classList.remove('hidden');
  } finally {
    isDataLoading = false;
    changeLoaderVisibility({ hide: true });
  }
}

(async function renderCardsInitial() {
  changeLoaderVisibility({ hide: false });

  const isSuperUser = await getIsSuperUser();
  if (!isSuperUser) {
    const unAuthorizedText = createElement({
      type: 'h1',
      attributes: { class: 'unauthorized-text' },
      innerText: 'You are not authorized to view this page.',
    });
    mainContainer.append(unAuthorizedText);
    changeLoaderVisibility({ hide: true });
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  status = urlParams.get('status') || 'all';

  if (!isDev && status !== 'all') {
    document.querySelector(`input[name="status"]#${status}`).checked = true;
  }

  if (applicationId) {
    await renderApplicationById(applicationId);
  }
  await renderApplicationCards('', status, true, applicationId);
  addIntersectionObserver();

  changeLoaderVisibility({ hide: true });
})();

const intersectionObserver = new IntersectionObserver(async (entries) => {
  if (!nextLink) {
    return;
  }
  if (entries[0].isIntersecting && !isDataLoading) {
    await renderApplicationCards(nextLink);
  }
});

const addIntersectionObserver = () => {
  intersectionObserver.observe(lastElementContainer);
};

if (isDev) {
  filterButton.addEventListener('click', () => {
    filterDropdown.style.display =
      filterDropdown.style.display === 'block' ? 'none' : 'block';
  });

  filterOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const filter = option.getAttribute('data-filter');
      applyFilter(filter);
    });
  });
} else {
  filterButton.addEventListener('click', () => {
    filterModal.classList.toggle('hidden');
    backDrop.style.display = 'flex';
  });

  backDrop.addEventListener('click', () => {
    filterModal.classList.add('hidden');
    backDrop.style.display = 'none';
  });

  applyFilterButton.addEventListener('click', () => {
    const selectedFilterOption = document.querySelector(
      'input[name="status"]:checked',
    );

    const selectedStatus = selectedFilterOption.value;
    addQueryParamInUrl('status', selectedStatus);
    changeFilter();
    status = selectedStatus;
    renderApplicationCards(nextLink, status);
  });

  clearButton.addEventListener('click', clearFilter);
}

function showAppliedFilter(filterApplied) {
  if (filterApplied) {
    filterLabel.classList.remove('hidden');
    filterText.textContent =
      'Status :' + filterApplied[0].toUpperCase() + filterApplied.substring(1);
  }
}

function applyFilter(filter) {
  if (filter.length > 0) {
    if (!filterLabel.classList.contains('hidden')) {
      filterLabel.classList.add('hidden');
    }
    addQueryParamInUrl('status', filter);
    changeFilter();
    status = filter;
    renderApplicationCards(nextLink, status);
    filterDropdown.style.display = 'none';
  }
}

filterRemove.addEventListener('click', () => {
  filterLabel.classList.add('hidden');
  filterText.textContent = '';
  removeQueryParamInUrl('status');
  changeFilter();
  renderApplicationCards(nextLink, status);
});

backDrop.addEventListener('click', () => {
  filterModal.classList.add('hidden');
  backDrop.style.display = 'none';
});

backDropBlur.addEventListener('click', closeApplicationDetails);
applicationCloseButton.addEventListener('click', closeApplicationDetails);

document.addEventListener('click', (e) => {
  if (!filterButton.contains(e.target) && !filterDropdown.contains(e.target)) {
    filterDropdown.style.display = 'none';
  }
});

closeDropdownBtn.addEventListener('click', () => {
  filterDropdown.style.display = 'none';
});

applicationAcceptButton.addEventListener('click', () =>
  updateUserApplication({ isAccepted: true }),
);
applicationRejectButton.addEventListener('click', () =>
  updateUserApplication({ isAccepted: false }),
);
