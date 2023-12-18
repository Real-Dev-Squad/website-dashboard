import { createElement, getApplications } from './utils.js';
let nextLink;
let isDataLoading = false;
const loader = document.querySelector('.loader');
const lastElementContainer = document.getElementById('page_bottom_element');

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

async function renderApplicationCards(next) {
  const applicationContainer = document.querySelector('.application-container');
  changeLoaderVisibility({ hide: false });
  isDataLoading = true;
  const data = await getApplications({
    applicationStatus: 'all',
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
  await renderApplicationCards();
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
