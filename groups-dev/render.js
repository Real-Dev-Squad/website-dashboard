const createCard = (rawGroup, onClick = () => {}) => {
  const group = {
    ...rawGroup,
    description:
      rawGroup.description ||
      'This is a default description. Please ask the role creator or admin to update this group description.',
  };

  const cardElement = document.createElement('div');
  cardElement.className = 'card';
  cardElement.id = `group-${group.id}`;
  cardElement.innerHTML = `
        <h5 class="card__title">${group.title}</h5>
        <p class="card__description">${group.description}</p>
        <div class="card__action">
            <button class="card__btn ${
              group.isUpdating && 'card__btn--blocked'
            }">${group.isMember ? 'Remove me' : 'Add me +'}</button>
            <span class="card__count">
                <span class="card__count-text">${group.count}</span>
                <img class="card__count-icon" src="assets/person.svg" alt="Members" />
            </span>
        </div>
    `;

  cardElement
    .querySelector('.card__btn')
    .addEventListener('click', () => group.isUpdating || onClick());

  return cardElement;
};

const createLoadingCard = () => {
  const cardElement = document.createElement('div');
  cardElement.className = 'card card--loading';
  cardElement.innerHTML = `
        <h5 class="card__title"></h5>
        <p class="card__description"></p>
        <div class="card__action">
            <div class="card__btn"></div>
        </div>
    `;

  return cardElement;
};

export { createCard, createLoadingCard };
