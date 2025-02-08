import {
  createCard,
  createGroupCreationModal,
  createLoadingCard,
  createNoGroupFound,
  createNavbarProfile,
  createNavbarProfileLoading,
  createNavbarProfileSignin,
  createDeleteConfirmationModal,
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

const renderLoader = () => {
  const loaderContainer = document.querySelector('.loader');

  if (!loaderContainer) {
    const loaderContainer = document.createElement('div');
    loaderContainer.className = 'loader';
    loaderContainer.innerHTML = `
      <div class="loader-spin"></div>
    `;

    document.body.appendChild(loaderContainer);
  }
};

const removeLoader = () => {
  const loader = document.querySelector('.loader');
  if (loader) {
    document.body.removeChild(loader);
  }
};

const renderGroupById = ({
  group,
  cardOnClick = () => {},
  onDelete = () => {},
  isSuperUser = false,
}) => {
  const card = createCard(group, cardOnClick, onDelete, isSuperUser);
  const mainContainer = document.querySelector('.group-container');
  const groupElement = document.getElementById(`group-${group.id}`);
  if (groupElement) {
    mainContainer.replaceChild(card, groupElement);
  } else {
    mainContainer.append(card);
  }
};

const renderMoreGroups = ({
  groups,
  cardOnClick = () => {},
  isSuperUser = false,
}) => {
  const mainContainer = document.querySelector('.group-container');
  console.log('Rendering groups:', groups);

  groups.forEach((group) => {
    if (!document.getElementById(`group-${group.id}`)) {
      const card = createCard(
        group,
        () => cardOnClick(group.id),
        () => {},
        isSuperUser,
      );
      mainContainer.appendChild(card);
    }
  });
};

const renderNoGroupFound = () => {
  const mainContainer = document.querySelector('.group-container');
  const noGroupContainer = document.createElement('div');
  noGroupContainer.className = 'no-group-container';
  noGroupContainer.append(createNoGroupFound());
  mainContainer.append(noGroupContainer);
};

const renderDeleteConfirmationModal = ({
  onClose = () => {},
  onConfirm = () => {},
}) => {
  const container = document.querySelector('body');
  const existingBackdrop = document.querySelector('.backdrop');

  if (existingBackdrop) {
    container.removeChild(existingBackdrop);
  }

  const modal = createDeleteConfirmationModal(onClose, onConfirm);
  container.appendChild(modal);
};

const removeDeleteConfirmationModal = () => {
  const container = document.querySelector('body');
  const backdrop = document.querySelector('.backdrop');
  if (backdrop) {
    container.removeChild(backdrop);
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
  renderMoreGroups,
  renderNoGroupFound,
  renderDeleteConfirmationModal,
  removeDeleteConfirmationModal,
  renderLoader,
  removeLoader,
};
