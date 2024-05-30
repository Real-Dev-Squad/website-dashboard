import {
  createCard,
  createGroupCreationModal,
  createLoadingCard,
  createNavbarProfile,
  createNavbarProfileLoading,
  createNavbarProfileSignin,
} from './createElements.js';

const renderNotAuthenticatedPage = () => {
  const mainContainer = document.querySelector('main');
  mainContainer.innerHTML = '';
  const errorElement = document.createElement('h1');
  errorElement.className = 'error';
  errorElement.innerText = 'You need to login to view this page';
  mainContainer.append(errorElement);
};

const renderGroupCreationModal = ({
  onClose = () => {},
  onSubmit = () => {},
}) => {
  const container = document.querySelector('body');
  const backdrop = document.querySelector('.backdrop');
  const groupCreationModal = backdrop?.querySelector('.create-group-modal');

  if (!groupCreationModal) {
    const groupCreationModal = createGroupCreationModal(onClose, onSubmit);
    container.append(groupCreationModal);
  }
};

const removeGroupCreationModal = () => {
  const container = document.querySelector('body');
  const backdrop = document.querySelector('.backdrop');

  if (backdrop) {
    container.removeChild(backdrop);
  }
};

const renderNavbarProfileSignin = () => {
  const profileElement = createNavbarProfileSignin();
  const profileEl = document.querySelector('.navbar__profile');
  profileEl.append(profileElement);
};

const removeLoadingNavbarProfile = () => {
  const profileEl = document.querySelector('.navbar__profile');
  const profileLoadingEl = profileEl.querySelector('.profile--loading');

  if (!profileLoadingEl) return;
  profileEl.removeChild(profileLoadingEl);
};

const renderLoadingNavbarProfile = () => {
  const profileElement = createNavbarProfileLoading();
  const profileEl = document.querySelector('.navbar__profile');
  profileEl.append(profileElement);
};

const renderNavbarProfile = ({ profile }) => {
  const profileElement = createNavbarProfile({
    name: profile.username.charAt(0).toUpperCase() + profile.username.slice(1),
    avatar: profile.picture?.url || 'assets/avatar.svg',
  });

  const profileEl = document.querySelector('.navbar__profile');
  profileEl.append(profileElement);
};

const renderLoadingCards = () => {
  const mainContainer = document.querySelector('.group-container');
  const cardCount = 6;
  for (let i = 0; i < cardCount; i++) {
    const card = createLoadingCard();
    mainContainer.append(card);
  }
};

const removeLoadingCards = () => {
  const mainContainer = document.querySelector('.group-container');
  if (!mainContainer) return;
  const loadingCards = mainContainer.querySelectorAll('.card--loading');
  loadingCards.forEach((card) => mainContainer.removeChild(card));
};

const renderGroupById = ({ group, cardOnClick = () => {} }) => {
  const card = createCard(group, cardOnClick);
  const mainContainer = document.querySelector('.group-container');
  const groupElement = document.getElementById(`group-${group.id}`);
  if (groupElement) {
    mainContainer.replaceChild(card, groupElement);
  } else {
    mainContainer.append(card);
  }
};

export {
  renderNotAuthenticatedPage,
  renderGroupCreationModal,
  removeGroupCreationModal,
  renderNavbarProfileSignin,
  removeLoadingNavbarProfile,
  renderLoadingNavbarProfile,
  renderNavbarProfile,
  renderLoadingCards,
  removeLoadingCards,
  renderGroupById,
};
