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
            <button class="card__btn"></button>
            <span class="card__count">
                <span class="card__count-text"></span>
                <img class="card__count-icon" src="assets/person.svg" alt="Members" />
            </span>
        </div>
    `;

  if (group.isUpdating)
    cardElement.querySelector('.card__btn').classList.add('card__btn--blocked');
  cardElement.querySelector('.card__title').textContent = group.title;
  cardElement.querySelector('.card__description').textContent =
    group.description;
  cardElement.querySelector('.card__btn').textContent = group.isMember
    ? 'Remove me'
    : 'Add me';
  if (group.isMember)
    cardElement
      .querySelector('.card__btn')
      .classList.add('card__btn--inverted');
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

export {
  createCard,
  createLoadingCard,
  createNavbarProfile,
  createNavbarProfileLoading,
  createNavbarProfileSignin,
};
