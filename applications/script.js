import { createElement, getApplications } from './utils.js';
let nextLink;
let isDataLoading = false;
const loader = document.querySelector('.loader');
const filterButton = document.getElementById('filter-button');
const filterModal = document.querySelector('.filter-modal');
const backDrop = document.querySelector('.backdrop');
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

function createApplicationCard({ username, companyName, skills, intro }) {
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
    innerText: username,
  });

  const companyNameText = createElement({
    type: 'p',
    attributes: { class: 'company-name' },
    innerText: `Company name: ${companyName}`,
  });

  const skillsText = createElement({
    type: 'p',
    attributes: { class: 'skills' },
    innerText: `Skills: ${skills}`,
  });

  userInfoContainer.appendChild(usernameText);
  userInfoContainer.appendChild(companyNameText);
  userInfoContainer.appendChild(skillsText);

  const introductionText = createElement({
    type: 'p',
    attributes: { class: 'user-intro' },
    innerText: intro,
  });

  const viewDetailsButton = createElement({
    type: 'button',
    attributes: { class: 'view-details-button' },
    innerText: 'View Details',
  });

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
      username: application.biodata.firstName,
      companyName: application.professional.institution,
      intro: `${application.intro.introduction.slice(0, 200)}...`,
      skills: application.professional.skills,
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

applyFilterButton.addEventListener('click', () => {
  const selectedFilterOption = document.querySelector(
    'input[name="status"]:checked',
  );
  changeFilter();
  status = selectedFilterOption.value;
  renderApplicationCards(nextLink, status);
});

clearButton.addEventListener('click', clearFilter);
