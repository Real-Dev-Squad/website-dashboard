const createCard = (rawGroup, onClick = () => {}) => {
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
        <h5 class="card__title"></h5>
        <p class="card__description"></p>
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
  cardElement.querySelector('.card__btn').textContent = group.isMember
    ? 'Remove me'
    : 'Add me';
  if (group.isMember)
    cardElement.querySelector('.card__btn').classList.add('button--secondary');
  cardElement.querySelector('.card__count-text').textContent = group.count;
  cardElement
    .querySelector('.card__btn')
    .addEventListener('click', () => group.isUpdating || onClick());

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
  const inputField = modalElement.querySelector('.input__field');
  const submitButton = modalElement.querySelector('.submit__button');
  modalElement.onclick = (e) => e.stopPropagation();
  modalElement.querySelector('#close-button').onclick = onClose;
  modalElement.querySelector('#clear-input').onclick = () => {
    inputField.value = '';
    toggle({ enabled: false });
  };

  function getInput() {
    return inputField.value.trim().toLowerCase();
  }

  inputField.addEventListener('input', () => {
    const inputValue = getInput();
    const shouldDisableSubmit =
      inputValue.length === 0 || inputValue.includes('group');

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
    const inputValue = getInput();
    if (inputValue.length === 0 || inputValue.includes('group')) {
      throw new Error('Invalid group name');
    }

    toggle({ enabled: false });
    onSubmit(inputField.value).then(() => {
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

export {
  createCard,
  createLoadingCard,
  createNavbarProfile,
  createNavbarProfileLoading,
  createNavbarProfileSignin,
  createGroupCreationModal,
};
