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
const filterButton = document.getElementById('filter-button');
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

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
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

  if (applicationTextarea.value) payload.feedback = applicationTextarea.value;

  updateApplication({
    applicationId: currentApplicationId,
    applicationPayload: payload,
  })
    .then((res) => {
      showToast({ type: 'success', message: res.message });
      setTimeout(() => closeApplicationDetails(), 1000);
    })
    .catch((error) => {
      showToast({ type: 'error', message: error.message });
    });
}

function changeFilter() {
  nextLink = '';
  filterModal.classList.add('hidden');
  backDrop.style.display = 'none';
  applicationContainer.innerHTML = '';
}

function closeApplicationDetails() {
  applicationDetailsModal.classList.add('hidden');
  backDropBlur.style.display = 'none';
  document.body.style.overflow = 'auto';

  if (applicationId) {
    window.location.href = '/applications';
  }
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
  });

  applicationSection.appendChild(applicationSectionTitle);
  applicationSection.appendChild(applicationTextArea);
  applicationDetailsMain.appendChild(applicationSection);

  if (application.status === 'pending') {
    applicationAcceptButton.classList.remove('hidden');
    applicationAcceptButton.disabled = false;
    applicationAcceptButton.style.cursor = 'pointer';
    applicationRejectButton.classList.remove('hidden');
    applicationRejectButton.disabled = false;
    applicationRejectButton.style.cursor = 'pointer';
  } else if (application.status === 'accepted') {
    applicationAcceptButton.classList.remove('hidden');
    applicationAcceptButton.disabled = true;
    applicationAcceptButton.style.cursor = 'not-allowed';
    applicationRejectButton.classList.remove('hidden');
    applicationRejectButton.disabled = false;
    applicationRejectButton.style.cursor = 'pointer';
  } else {
    applicationAcceptButton.classList.remove('hidden');
    applicationAcceptButton.disabled = false;
    applicationAcceptButton.style.cursor = 'pointer';
    applicationRejectButton.classList.remove('hidden');
    applicationRejectButton.disabled = true;
    applicationRejectButton.style.cursor = 'not-allowed';
  }
}

function clearFilter() {
  if (status === 'all') return;
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
    attributes: { class: 'company-name' },
    innerText: `Company name: ${application.professional.institution}`,
  });

  const skillsText = createElement({
    type: 'p',
    attributes: { class: 'skills' },
    innerText: `Skills: ${application.professional.skills}`,
  });

  userInfoContainer.appendChild(usernameText);
  userInfoContainer.appendChild(companyNameText);
  userInfoContainer.appendChild(skillsText);

  const introductionText = createElement({
    type: 'p',
    attributes: { class: 'user-intro' },
    innerText: application.intro.introduction.slice(0, 200),
  });

  const viewDetailsButton = createElement({
    type: 'button',
    attributes: { class: 'view-details-button' },
    innerText: 'View Details',
  });

  viewDetailsButton.addEventListener('click', () =>
    openApplicationDetails(application),
  );

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

  if (applicationId) {
    await renderApplicationById(applicationId);
  } else {
    await renderApplicationCards('', status, true);
    addIntersectionObserver();
  }

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

filterButton.addEventListener('click', () => {
  filterModal.classList.toggle('hidden');
  backDrop.style.display = 'flex';
});

backDrop.addEventListener('click', () => {
  filterModal.classList.add('hidden');
  backDrop.style.display = 'none';
});

backDropBlur.addEventListener('click', closeApplicationDetails);
applicationCloseButton.addEventListener('click', closeApplicationDetails);

applyFilterButton.addEventListener('click', () => {
  const selectedFilterOption = document.querySelector(
    'input[name="status"]:checked',
  );
  changeFilter();
  status = selectedFilterOption.value;
  renderApplicationCards(nextLink, status);
});

clearButton.addEventListener('click', clearFilter);

applicationAcceptButton.addEventListener('click', () =>
  updateUserApplication({ isAccepted: true }),
);
applicationRejectButton.addEventListener('click', () =>
  updateUserApplication({ isAccepted: false }),
);
