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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.4115 12L18.6952 6.71628C18.7906 6.62419 18.8666 6.51404 18.919 6.39225C18.9713 6.27046 18.9988 6.13947 19 6.00692C19.0011 5.87438 18.9759 5.74293 18.9257 5.62025C18.8755 5.49756 18.8013 5.38611 18.7076 5.29238C18.6139 5.19865 18.5024 5.12453 18.3798 5.07434C18.2571 5.02414 18.1256 4.99889 17.9931 5.00004C17.8605 5.00119 17.7295 5.02873 17.6078 5.08104C17.486 5.13336 17.3758 5.20941 17.2837 5.30475L12 10.5885L6.71628 5.30475C6.528 5.12291 6.27584 5.0223 6.01411 5.02457C5.75237 5.02685 5.502 5.13183 5.31691 5.31691C5.13183 5.502 5.02685 5.75237 5.02457 6.01411C5.0223 6.27584 5.12291 6.528 5.30475 6.71628L10.5885 12L5.30475 17.2837C5.20941 17.3758 5.13336 17.486 5.08104 17.6078C5.02873 17.7295 5.00119 17.8605 5.00004 17.9931C4.99889 18.1256 5.02414 18.2571 5.07434 18.3798C5.12453 18.5024 5.19865 18.6139 5.29238 18.7076C5.38611 18.8013 5.49756 18.8755 5.62025 18.9257C5.74293 18.9759 5.87438 19.0011 6.00692 19C6.13947 18.9988 6.27046 18.9713 6.39225 18.919C6.51404 18.8666 6.62419 18.7906 6.71628 18.6952L12 13.4115L17.2837 18.6952C17.472 18.8771 17.7242 18.9777 17.9859 18.9754C18.2476 18.9732 18.498 18.8682 18.6831 18.6831C18.8682 18.498 18.9732 18.2476 18.9754 17.9859C18.9777 17.7242 18.8771 17.472 18.6952 17.2837L13.4115 12Z" fill="#6B7280"/>
          </svg>        
        </button>
        <h2 class="header">Create a new group</h2>
        <div class="disclaimer">
          <img class="disclaimer__icon" src="assets/info.svg"/>
          <span class="disclaimer__text">
            Role name should not contain group name
          </span>
        </div>
        <form class="form">
            <div class="input">
              <label for="title" class="input__label">@group</label>
              <div class="input__container">
                <input
                  class="input__field"
                  type="text"
                  name="title"
                  placeholder="demo group role"
                />
                <button type="button" id="clear-input">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.94069 7.99992L12.4632 4.47744C12.5267 4.41605 12.5774 4.34261 12.6123 4.26142C12.6472 4.18022 12.6655 4.0929 12.6663 4.00453C12.6671 3.91617 12.6502 3.82854 12.6168 3.74675C12.5833 3.66496 12.5339 3.59066 12.4714 3.52817C12.4089 3.46569 12.3346 3.41627 12.2528 3.38281C12.1711 3.34935 12.0834 3.33251 11.9951 3.33328C11.9067 3.33404 11.8194 3.3524 11.7382 3.38728C11.657 3.42216 11.5835 3.47286 11.5222 3.53642L7.99967 7.0589L4.47719 3.53642C4.35168 3.41519 4.18357 3.34812 4.00908 3.34963C3.83459 3.35115 3.66767 3.42114 3.54428 3.54453C3.42089 3.66792 3.3509 3.83483 3.34939 4.00932C3.34787 4.18381 3.41495 4.35192 3.53618 4.47744L7.05866 7.99992L3.53618 11.5224C3.47261 11.5838 3.42192 11.6572 3.38704 11.7384C3.35216 11.8196 3.3338 11.9069 3.33303 11.9953C3.33227 12.0837 3.3491 12.1713 3.38257 12.2531C3.41603 12.3349 3.46544 12.4092 3.52793 12.4717C3.59041 12.5342 3.66472 12.5836 3.7465 12.617C3.82829 12.6505 3.91592 12.6673 4.00429 12.6666C4.09265 12.6658 4.17998 12.6474 4.26117 12.6126C4.34237 12.5777 4.4158 12.527 4.47719 12.4634L7.99967 8.94093L11.5222 12.4634C11.6477 12.5846 11.8158 12.6517 11.9903 12.6502C12.1648 12.6487 12.3317 12.5787 12.4551 12.4553C12.5785 12.3319 12.6484 12.165 12.65 11.9905C12.6515 11.816 12.5844 11.6479 12.4632 11.5224L8.94069 7.99992Z" fill="#6B7280"/>
                  </svg>
                </button>
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
  };

  function getInput() {
    return inputField.value.trim().toLowerCase();
  }

  inputField.addEventListener('input', () => {
    const inputValue = getInput();
    const shouldDisableSubmit =
      inputValue.length === 0 || inputValue.includes('group');

    toggleSubmitButton({ enabled: !shouldDisableSubmit });
  });

  function toggleSubmitButton({ enabled }) {
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

    toggleSubmitButton({ enabled: false });
    onSubmit(inputField.value).then(() => {
      toggleSubmitButton({ enabled: true });
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
