let currentUserDetails;
const filterStates = {};
const container = document.querySelector('.container');
const sortButton = document.querySelector(SORT_BUTTON);
const ascIcon = document.getElementById(SORT_ASC_ICON);
const descIcon = document.getElementById(SORT_DESC_ICON);
const filterButtons = document.querySelectorAll('#filter-button');
const profileDiffsContainer = document.querySelector('.profile-diffs');
const searchElement = document.getElementById(SEARCH_ELEMENT);
const lastElementContainer = document.querySelector(LAST_ELEMENT_CONTAINER);
let nextLink = '';
let isDataLoading = false;

const toast = document.getElementById('toast');

function showToast({ message, type }) {
  toast.innerText = message;

  if (type === 'success') {
    toast.classList.add('success');
    toast.classList.remove('failure');
  } else {
    toast.classList.add('failure');
    toast.classList.remove('success');
  }

  toast.classList.remove('hidden');
  toast.classList.add('animated_toast');

  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('animated_toast');
  }, 3000);
}

const addTooltipToSortButton = () => {
  const sortToolTip = createElement({
    type: 'span',
    attributes: { class: 'tooltip sort-button-tooltip' },
    innerText:
      filterStates.order === Order.ASCENDING ? OLDEST_FIRST : NEWEST_FIRST,
  });
  sortButton.appendChild(sortToolTip);
};

function toggleStatusButton(statusValue) {
  if (!statusValue) return;
  filterButtons.forEach((filterButton) => {
    filterButton.classList.toggle(
      'selected',
      filterButton.name === statusValue,
    );
  });
}

const updateUrl = () => {
  if (history.pushState) {
    window.history.pushState(
      null,
      '',
      `${window.location.protocol}//${
        window.location.host
      }${generateProfileDiffsParams(filterStates, false)}`,
    );
  }
};

const updateUIBasedOnFilterStates = () => {
  if (filterStates.order === 'asc') {
    descIcon.style.display = 'none';
    ascIcon.style.display = 'block';
  } else {
    ascIcon.style.display = 'none';
    descIcon.style.display = 'block';
  }
  toggleStatusButton(filterStates.status);
  searchElement.value = filterStates.username;
};

const render = async () => {
  if (window.location.search) {
    parseProfileDiffParams(window.location.search, filterStates);
    filterStates.order ||= Order.DESCENDING;
    filterStates.username ||= '';
  } else {
    Object.assign(filterStates, {
      status: Status.PENDING,
      order: Order.DESCENDING,
      size: DEFAULT_PAGE_SIZE,
      username: '',
    });
  }
  addTooltipToSortButton();
  updateUIBasedOnFilterStates();
  changeFilter();
  updateUrl();
  await populateProfileDiffs(filterStates);
  addIntersectionObserver();
};

const changeFilter = () => {
  nextLink = '';
  profileDiffsContainer.innerHTML = '';
};

let profileDiffsListElement;

async function populateProfileDiffs(query = {}, newLink) {
  try {
    isDataLoading = true;
    const profileDiffsElement = document.getElementById('profile-diffs');
    if (!newLink) profileDiffsElement.innerHTML = '';
    const profileDiffs = await getProfileDiffs(query, newLink);
    if (profileDiffs?.notAuthorized) {
      showToast({ type: 'error', message: 'You are not AUTHORIZED!' });
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 3000);
      return;
    }
    nextLink = profileDiffs.next;
    const allProfileDiffs = profileDiffs.profileDiffs;

    if (!newLink) {
      if (allProfileDiffs.length === 0) {
        profileDiffsElement.innerHTML = 'No Data found!';
        return;
      }
      profileDiffsElement.innerHTML = '';
      profileDiffsListElement = createElement({
        type: 'div',
        attributes: { class: 'profileDiffs__list-container' },
      });
    }
    profileDiffsElement.appendChild(profileDiffsListElement);

    // Create all profile diff cards with shimmer effect
    allProfileDiffs.forEach((data) => {
      const card = createProfileDiffCard(data);
      profileDiffsListElement.appendChild(card);
    });

    // Fetch user details and update cards
    allProfileDiffs.forEach(async (data) => {
      const user = await getUser(data.userId);
      updateProfileDiffCard(data.id, user);
    });
  } catch (error) {
    showToast({ type: 'error', message: 'Something went wrong!' });
  } finally {
    isDataLoading = false;
  }
}

const updateFilterStates = (key, value) => {
  filterStates[key] = value;
};

const toggleSortIconAndOrder = () => {
  const tooltip = sortButton.querySelector('.tooltip');
  const isAscending = filterStates.order === Order.ASCENDING;

  tooltip.textContent = isAscending ? NEWEST_FIRST : OLDEST_FIRST;
  ascIcon.style.display = isAscending ? 'block' : 'none';
  descIcon.style.display = isAscending ? 'none' : 'block';

  updateFilterStates('order', isAscending ? Order.DESCENDING : Order.ASCENDING);
  updateUrl();
};

const changeStatus = (status) => {
  updateFilterStates('status', status);
  updateUrl();
};

const changeUsername = (username) => {
  updateFilterStates('username', username);
  updateUrl();
};

function debounce(func, delay) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => func(...args), delay);
  };
}

function createProfileDiffCard(data) {
  const time = data.timestamp;
  const fireBaseTime = new Date(
    time._seconds * 1000 + time._nanoseconds / 1000000,
  );
  const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  }).format(fireBaseTime);
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(fireBaseTime);

  const profileCard = createElement({
    type: 'div',
    attributes: { class: 'profile-card', 'data-id': data.id },
  });
  if (filterStates.status === Status.PENDING) {
    profileCard.style.cursor = 'pointer';
    profileCard.addEventListener('click', () => {
      window.location.href = `/profile-diff-details/?id=${data.id}`;
    });
  }

  const profileCardLeft = createElement({
    type: 'div',
    attributes: { class: 'profile shimmer' },
  });
  const profileCardPhoto = createElement({
    type: 'div',
    attributes: { class: 'profile-pic' },
  });
  const profileCardInfo = createElement({
    type: 'div',
    attributes: { class: 'profile-info' },
  });
  const profileCardName = createElement({
    type: 'div',
    attributes: { class: 'profile-name-shimmer' },
  });
  const profileCardUsername = createElement({
    type: 'div',
    attributes: { class: 'profile-username-shimmer' },
  });

  profileCardInfo.appendChild(profileCardName);
  profileCardInfo.appendChild(profileCardUsername);
  profileCardLeft.appendChild(profileCardPhoto);
  profileCardLeft.appendChild(profileCardInfo);
  profileCard.appendChild(profileCardLeft);

  const profileCardRight = createElement({
    type: 'div',
    attributes: { class: 'profile-card_right' },
  });
  const profileCardRightDate = createElement({
    type: 'span',
    attributes: { class: 'profile-card_right-date-time' },
    innerText: `${date}`,
  });
  const profileCardRightTime = createElement({
    type: 'span',
    attributes: { class: 'profile-card_right-date-time' },
    innerText: `${formattedTime.toLowerCase()}`,
  });
  profileCardRight.appendChild(profileCardRightDate);
  profileCardRight.appendChild(profileCardRightTime);
  profileCard.appendChild(profileCardLeft);
  profileCard.appendChild(profileCardRight);

  return profileCard;
}

function updateProfileDiffCard(cardId, user) {
  const card = document.querySelector(`.profile-card[data-id="${cardId}"]`);
  if (!card) return;

  const profileLeft = card.querySelector('.profile');
  const profilePic = card.querySelector('.profile-pic');
  const profileName = card.querySelector('.profile-name-shimmer');
  const profileUsername = card.querySelector('.profile-username-shimmer');

  profileLeft.classList.remove('shimmer');
  profilePic.style.backgroundImage = `url(${user.picture?.url})`;
  profilePic.style.backgroundSize = 'cover';

  profileName.classList.remove('profile-name-shimmer');
  profileName.classList.add('profile-name');
  profileName.textContent = `${user.first_name} ${user.last_name}`;

  profileUsername.classList.remove('profile-username-shimmer');
  profileUsername.classList.add('profile-username');
  profileUsername.textContent = `${user.username}`;
}

const addIntersectionObserver = () => {
  intersectionObserver.observe(lastElementContainer);
};

const intersectionObserver = new IntersectionObserver(async (entries) => {
  if (entries[0].isIntersecting && !isDataLoading && nextLink) {
    await populateProfileDiffs({}, nextLink);
  }
});

render();

sortButton.addEventListener('click', async () => {
  toggleSortIconAndOrder();
  changeFilter();
  await populateProfileDiffs(filterStates);
});

searchElement.addEventListener(
  'input',
  debounce(async (event) => {
    changeUsername(event.target.value);
    await populateProfileDiffs(filterStates);
  }, 500),
);

filterButtons.forEach((filterButton) => {
  filterButton.addEventListener('click', async (event) => {
    toggleStatusButton(filterButton.name);
    changeStatus(filterButton.name);
    await populateProfileDiffs(filterStates);
  });
});
