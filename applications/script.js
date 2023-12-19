import { createElement, getApplications } from './utils.js';
let nextLink;
let isDataLoading = false;
const loader = document.querySelector('.loader');
const filterButton = document.getElementById('filter-button');
const filterModal = document.querySelector('.filter-modal');
const backDrop = document.querySelector('.backdrop');
const backDropBlur = document.querySelector('.backdrop-blur');
const applicationDetailsModal = document.querySelector('.application-details');
const applicationDetailsMain = document.querySelector(
  '.application-details-main',
);
const applyFilterButton = document.getElementById('apply-filter-button');
const applicationContainer = document.querySelector('.application-container');
const clearButton = document.getElementById('clear-button');
const lastElementContainer = document.getElementById('page_bottom_element');

let status = 'all';

function changeFilter() {
  nextLink = '';
  filterModal.classList.add('hidden');
  applicationContainer.innerHTML = '';
}

function openApplicationDetails(application) {
  applicationDetailsMain.innerHTML = '';
  backDropBlur.style.display = 'flex';
  applicationDetailsModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  const selectedApplication = {
    username: application.biodata.firstName,
    id: application.id,
    applicationDetails: [
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

async function renderApplicationCards(next, status) {
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
  applications.forEach((application) => {
    const applicationCard = createApplicationCard({
      application,
    });
    applicationContainer.appendChild(applicationCard);
  });
}

(async function renderCardsInitial() {
  await renderApplicationCards('', status);
  addIntersectionObserver();
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

backDropBlur.addEventListener('click', () => {
  applicationDetailsModal.classList.add('hidden');
  backDropBlur.style.display = 'none';
  document.body.style.overflow = 'auto';
});

applyFilterButton.addEventListener('click', () => {
  const selectedFilterOption = document.querySelector(
    'input[name="status"]:checked',
  );
  changeFilter();
  status = selectedFilterOption.value;
  renderApplicationCards(nextLink, status);
});

clearButton.addEventListener('click', clearFilter);
