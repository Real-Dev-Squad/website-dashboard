import { fullDateString, shortDateString } from './utils.js';

const createCard = (
  rawGroup,
  onClick = () => {},
  onDelete = () => {},
  isSuperUser = false,
) => {
  const group = {
    ...rawGroup,
    description:
      rawGroup.description ||
      'Please ask the role creator or admin to update this group description.',
  };

  const cardElement = document.createElement('div');
  cardElement.className = 'card';
  cardElement.id = `group-${group.id}`;
  cardElement.innerHTML = `
        <div class="card__header">
          <h5 class="card__title"></h5>
          ${
            isSuperUser
              ? `
            <button class="delete-group">
              <img class="delete-group__icon" src="assets/delete.svg" alt="Delete" />
            </button>`
              : ''
          }  
        </div>
        <p class="card__description"></p>
        <p class="card__last-used"></p>
        <div class="card__action">
            <button class="card__btn button"></button>
            <span class="card__count">
                <span class="card__count-text"></span>
                <img class="card__count-icon" src="assets/person.svg" alt="Members" />
            </span>
        </div>
    `;

  if (group.isUpdating)
    cardElement.querySelector('.card__btn').classList.add('button--blocked');
  cardElement.querySelector('.card__title').textContent = group.title;
  cardElement.querySelector('.card__description').textContent =
    group.description;
  const lastUsedElement = cardElement.querySelector('.card__last-used');
  if (group.lastUsedTimestamp) {
    const shortFormatted = shortDateString(group.lastUsedTimestamp);
    lastUsedElement.classList.add('tooltip-container');
    lastUsedElement.textContent = `Last used on: ${shortFormatted}`;

    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.innerText = fullDateString(group.lastUsedTimestamp);
    lastUsedElement.appendChild(tooltip);
  } else {
    lastUsedElement.style.display = 'none';
  }
  cardElement.querySelector('.card__btn').textContent = group.isMember
    ? 'Remove me'
    : 'Add me';
  if (group.isMember)
    cardElement.querySelector('.card__btn').classList.add('button--secondary');
  cardElement.querySelector('.card__count-text').textContent = group.count;
  cardElement
    .querySelector('.card__btn')
    .addEventListener('click', () => group.isUpdating || onClick());

  if (isSuperUser) {
    cardElement
      .querySelector('.delete-group')
      .addEventListener('click', (e) => {
        e.stopPropagation();
        onDelete(rawGroup.id);
      });
  }

  return cardElement;
};

const createLoadingCard = () => {
  const cardElement = document.createElement('div');
  cardElement.className = 'card card--loading';
  cardElement.innerHTML = `
        <div class="card__body">
            <h5 class="card__title"></h5>
            <p class="card__description"></p>
        </div>
        <div class="card__action">
            <div class="card__btn"></div>
        </div>
    `;

  return cardElement;
};

const createNoGroupFound = () => {
  const noGroupFound = document.createElement('div');
  noGroupFound.classList.add('no-group');
  noGroupFound.innerHTML = `
        <svg class="icon" fill=currentColor viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>
        <div class="message">
            <h2>No groups found</h2>
            <p>Please try a different search input</p>
        </div>
    `;

  return noGroupFound;
};

const createNavbarProfile = (profile) => {
  const profileElement = document.createElement('div');
  profileElement.className = 'profile';
  profileElement.innerHTML = `
        <h5 class="profile__name"></h5>
        <img class="profile__avatar" />
    `;

  profileElement.querySelector(
    '.profile__name',
  ).textContent = `Hello, ${profile.name}`;
  profileElement.querySelector(
    '.profile__avatar',
  ).alt = `Avatar of ${profile.name}`;
  profileElement.querySelector('.profile__avatar').src = profile.avatar;

  return profileElement;
};

const createNavbarProfileLoading = () => {
  const profileElement = document.createElement('div');
  profileElement.className = 'profile profile--loading';

  return profileElement;
};

const createNavbarProfileSignin = () => {
  const profileElement = document.createElement('a');
  profileElement.className = 'signin';
  profileElement.innerHTML = `
      <span class="signin__text">Sign In With GitHub</span>
      <img class="signin__img" src="assets/github.png" />
    `;

  profileElement.href = `https://github.com/login/oauth/authorize?client_id=23c78f66ab7964e5ef97&}&state=${window.location.href}`;
  return profileElement;
};

const createGroupCreationModal = (onClose = () => {}, onSubmit = () => {}) => {
  const backdropElement = document.createElement('div');
  const modalElement = document.createElement('div');
  modalElement.className = 'group-creation-modal';
  modalElement.innerHTML = `
        <button type="button" id="close-button" class="button button--minimal">
          <img src="assets/close.svg" alt="Close" />
        </button>
        <h2 class="header">Create a new group</h2>
        <div class="disclaimer">
          <img class="disclaimer__icon" src="assets/info.svg"/>
          <span class="disclaimer__text">
            Role name should not contain group name
          </span>
        </div>
        <form class="form">
            <div class="input" id="title">
              <label for="title" class="input__label">@group</label>
              <div class="input__container">
                <input
                  class="input__field"
                  type="text"
                  name="title"
                  placeholder="demo group role"
                />
                <button type="button" id="clear-input">
                  <img src="assets/close.svg" alt="Clear" />
                </button>
              </div>
            </div>
            <div class="input" id="description">
              <label for="description" class="input__label">Description</label>
              <div class="input__container">
                <textarea
                  class="input__field"
                  name="description"
                  placeholder="This group is for..." 
                ></textarea>
              </div>
            </div>

            <div class="spacer"></div>
            <button type="submit" class="submit__button submit__button--disabled button">Create</button>
        </form>
    `;
  const titleField = modalElement.querySelector('#title .input__field');
  const descriptionField = modalElement.querySelector(
    '#description .input__field',
  );
  const submitButton = modalElement.querySelector('.submit__button');
  modalElement.onclick = (e) => e.stopPropagation();
  modalElement.querySelector('#close-button').onclick = onClose;
  modalElement.querySelector('#clear-input').onclick = () => {
    titleField.value = '';
    toggle({ enabled: false });
  };

  function getTitle() {
    return titleField.value.trim().toLowerCase();
  }

  titleField.addEventListener('input', () => {
    const title = getTitle();
    const shouldDisableSubmit = title.length === 0 || title.includes('group');

    toggle({ enabled: !shouldDisableSubmit });
  });

  function toggle({ enabled }) {
    if (enabled) {
      submitButton.classList.remove('submit__button--disabled');
    } else {
      submitButton.classList.add('submit__button--disabled');
    }
  }

  const form = modalElement.querySelector('.form');

  form.onsubmit = (e) => {
    e.preventDefault();
    const title = getTitle();
    const description = descriptionField.value.trim();
    if (title.length === 0 || title.includes('group')) {
      throw new Error('Invalid group name');
    }

    toggle({ enabled: false });
    onSubmit({
      title,
      description,
    }).then(() => {
      toggle({ enabled: true });
    });
  };

  backdropElement.className = 'backdrop';
  backdropElement.appendChild(modalElement);
  backdropElement.onclick = (e) => {
    e.stopPropagation();
    onClose();
  };

  return backdropElement;
};

const createDeleteConfirmationModal = (
  onClose = () => {},
  onConfirm = () => {},
) => {
  const backdropElement = document.createElement('div');
  backdropElement.className = 'backdrop';

  const modalElement = document.createElement('div');
  modalElement.className = 'delete-confirmation-modal';
  modalElement.innerHTML = `
    <div class="delete-modal__header">
      <h2 class="delete-modal__title">Confirm Delete</h2>
      <button type="button" id="close-button" class="delete-modal__close">
        <img src="assets/close.svg" alt="Close" />
      </button>
    </div>
    <div class="delete-modal__content">
      <p class="delete-modal__msg"> Are you sure you want to delete this group? </p>
    </div>
    
    <div class="delete-modal__buttons">
      <button class="delete-modal-button button--secondary" id="cancel-delete">Cancel</button>
      <button class="delete-modal-button button--danger" id="confirm-delete">Delete</button>
    </div>
  `;

  modalElement.querySelector('#close-button').onclick = onClose;
  modalElement.querySelector('#cancel-delete').onclick = onClose;
  modalElement.querySelector('#confirm-delete').onclick = onConfirm;

  backdropElement.appendChild(modalElement);
  backdropElement.onclick = (e) => {
    if (e.target === backdropElement) onClose();
  };

  return backdropElement;
};

export {
  createCard,
  createLoadingCard,
  createNoGroupFound,
  createNavbarProfile,
  createNavbarProfileLoading,
  createNavbarProfileSignin,
  createGroupCreationModal,
  createDeleteConfirmationModal,
};
