const API_BASE_URL = window.API_BASE_URL;
const SKILLS_API = 'https://services.realdevsquad.com/skilltree/v1/skills';

const suggestedUsers = [];
const allUser = [];

const params = new URLSearchParams(window.location.search);
const isDev = params.get('dev') === 'true';

// hide fields under isDev feature flag
const containers = [
  'featureUrlContainer',
  'featureGroupContainer',
  'taskLevelContainer',
];

function hideElements(isDev, elementIds) {
  if (isDev) {
    elementIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = 'none';
      }
    });
  }
}
// hide fields if dev=true
hideElements(isDev, containers);

const skillComponentDiv = document
  .querySelector('.multi-select-button')
  ?.closest('.inputBox');
if (!isDev && skillComponentDiv) {
  skillComponentDiv.style.display = 'none';
}
class MultiSelect {
  constructor(container) {
    this.container = container;
    this.selectedValues = new Set();
    this.button = container.querySelector('.multi-select-button');
    this.selectedItemsContainer = container.querySelector('.selected-items');
    this.placeholder = container.querySelector('.placeholder');
    this.popover = container.querySelector('.popover');
    this.searchInput = container.querySelector('.search-input');
    this.optionsList = container.querySelector('.options-list');
    this.options = [];
    this.focusedIndex = -1;

    this.initializeSkills();
    this.bindEvents();
  }

  async initializeSkills() {
    try {
      const skills = await this.fetchSkills();
      this.options = skills.map((skill) => ({
        value: skill.id.toString(),
        label: skill.name,
      }));
      this.init();
    } catch (error) {
      alert(`Error Initializing skills: ${error}`);
    }
  }

  async fetchSkills() {
    if (!isDev) return [];
    try {
      const response = await fetch(SKILLS_API, {
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      alert(`Error fetching skills: ${error}`);
      return [];
    }
  }
  getSelectedSkills() {
    return Array.from(this.selectedValues)
      .map((value) => {
        const option = this.options.find((opt) => opt.value === value);
        return option
          ? {
              id: option.value,
              name: option.label,
            }
          : null;
      })
      .filter(Boolean);
  }

  init() {
    this.options.forEach((option) => {
      const optionElement = document.createElement('div');
      optionElement.className = 'option';
      optionElement.dataset.value = option.value;
      optionElement.innerHTML = `
      <span class="option-label">${option.label}</span>
      <span class="checkbox"></span>
      `;
      this.optionsList.appendChild(optionElement);
    });
  }
  bindEvents() {
    this.button.addEventListener('click', () => this.togglePopover());

    this.optionsList.addEventListener('click', (e) => {
      const option = e.target.closest('.option');
      if (option) {
        const value = option.dataset.value;
        if (value === 'select-all') {
          this.toggleAll();
        } else {
          this.toggleOption(value);
        }
      }
    });

    this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.searchInput.addEventListener('input', (e) => {
      const searchText = e.target.value.toLowerCase();
      const options = this.optionsList.querySelectorAll(
        '.option:not([data-value="select-all"])',
      );
      options.forEach((option) => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchText) ? '' : 'none';
      });
    });

    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.closePopover();
      }
    });
  }

  handleKeydown(e) {
    const visibleOptions = Array.from(
      this.optionsList.querySelectorAll('.option'),
    ).filter((option) => option.style.display !== 'none');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusedIndex = Math.min(
          this.focusedIndex + 1,
          visibleOptions.length - 1,
        );
        this.updateFocusedOption(visibleOptions);
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
        this.updateFocusedOption(visibleOptions);
        break;

      case 'Enter':
        e.preventDefault();
        if (this.focusedIndex >= 0) {
          const focusedOption = visibleOptions[this.focusedIndex];
          const value = focusedOption.dataset.value;
          if (value === 'select-all') {
            this.toggleAll();
          } else {
            this.toggleOption(value);
          }
        }
        break;

      case 'Escape':
        this.closePopover();
        break;
    }
  }

  updateFocusedOption(options) {
    options.forEach((option, index) => {
      if (index === this.focusedIndex) {
        option.classList.add('focused');
        option.scrollIntoView({ block: 'nearest' });
      } else {
        option.classList.remove('focused');
      }
    });
  }

  createBadge(option) {
    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.innerHTML = `
      <span class="text">${option.label}</span>
      <span class="remove">×</span>
    `;

    badge.querySelector('.remove').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleOption(option.value);
    });
    return badge;
  }

  togglePopover() {
    const isVisible = this.popover.style.display === 'block';
    this.popover.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      this.searchInput.focus();
      this.searchInput.value = '';
      this.focusedIndex = -1;
      const options = this.optionsList.querySelectorAll('.option');
      options.forEach((option) => {
        option.style.display = '';
        option.classList.remove('focused');
      });
    }
  }

  closePopover() {
    this.popover.style.display = 'none';
  }

  toggleOption(value) {
    if (this.selectedValues.has(value)) {
      this.selectedValues.delete(value);
    } else {
      this.selectedValues.add(value);
    }
    this.updateUI();
  }

  toggleAll() {
    if (this.selectedValues.size === this.options.length) {
      this.clearSelection();
    } else {
      this.options.forEach((option) => this.selectedValues.add(option.value));
    }
    this.updateUI();
  }

  clearSelection() {
    this.selectedValues.clear();
    this.updateUI();
  }

  updateUI() {
    this.selectedItemsContainer.innerHTML = '';
    this.placeholder.style.display = this.selectedValues.size ? 'none' : '';

    const selectedOptions = Array.from(this.selectedValues)
      .map((value) => this.options.find((opt) => opt.value === value))
      .filter(Boolean);

    selectedOptions.forEach((option) => {
      this.selectedItemsContainer.appendChild(this.createBadge(option));
    });

    this.optionsList.querySelectorAll('.option').forEach((option) => {
      const checkbox = option.querySelector('.checkbox');
      if (option.dataset.value === 'select-all') {
        checkbox.classList.toggle(
          'checked',
          this.selectedValues.size === this.options.length,
        );
      } else {
        checkbox.classList.toggle(
          'checked',
          this.selectedValues.has(option.dataset.value),
        );
      }
    });
  }
}

// Initialize the component
const multiSelect = new MultiSelect(
  document.querySelector('.multi-select-container'),
);

const category = document.getElementById('category');

category.addEventListener('change', async () => {
  if (isDev) return;

  try {
    showSubmitLoader();
    const categoryValue = category.value;
    const response = await fetch(
      `${API_BASE_URL}/users/suggestedUsers/${categoryValue}`,
      { credentials: 'include' },
    );
    const data = await response.json();
    const { users } = data;
    users.map((user) => suggestedUsers.push(user.user));
  } catch (err) {
    alert(err);
  } finally {
    showSubmitLoader(false);
  }
});
let usersData = [];

const getRemainingDays = (selectedDateInString) => {
  const selectedDate = new Date(selectedDateInString);
  const currentDate = new Date(getFutureDateString(0));
  const remainingDays = Math.ceil(
    Math.abs(selectedDate - currentDate) / (1000 * 3600 * 24),
  );
  return remainingDays;
};

const getFutureDateString = (numberOfDays = 14) => {
  const futureDateInMillis = new Date().setDate(
    new Date().getDate() + numberOfDays,
  );
  const futureDateStringArray = new Date(futureDateInMillis)
    .toLocaleDateString('en-IN')
    .split('/');
  if (futureDateStringArray[0].length === 1) {
    futureDateStringArray[0] = '0' + futureDateStringArray[0];
  }
  if (futureDateStringArray[1].length === 1) {
    futureDateStringArray[1] = '0' + futureDateStringArray[1];
  }
  const futureDateString = futureDateStringArray.reverse().join('-');
  return futureDateString;
};

const getDaysInEpoch = (remainingDays) => {
  const daysInSecond = new Date() / 1000 + remainingDays * 86400;
  return daysInSecond;
};

const setDefaultDates = () => {
  if (document.getElementById('status').value === StatusType.ASSIGNED) {
    const endsOn = document.getElementById('endsOn');
    endsOn.value = getFutureDateString(14);
    endsOn.min = getFutureDateString(1);
    endsOn.max = getFutureDateString(365);
    const previewDate = document.getElementById('remainingDays').children[0];
    previewDate.innerHTML = getRemainingDays(getFutureDateString(14));
  } else {
    handleStatusChange();
  }
};
setDefaultDates();

function getObjectOfFormData(formId) {
  const object = {};
  const data = new FormData(formId);
  const isStatusAssigned =
    document.getElementById('status').value === StatusType.ASSIGNED;

  data.forEach((value, key) => {
    if (!Reflect.has(object, key)) {
      if (key === 'endsOn') {
        const endsOn = document.getElementById('endsOn');
        if (isStatusAssigned && endsOn.validity.valid) {
          value = getDaysInEpoch(getRemainingDays(endsOn.value));
        } else {
          value = isStatusAssigned
            ? getDaysInEpoch(getRemainingDays(getFutureDateString()))
            : null;
        }
      }
      object[key] = value;
      return;
    }
    if (!Array.isArray(object[key])) {
      object[key] = [object[key]];
    }
    object[key].push(value);
  });
  return object;
}

const showSubmitLoader = (show = true) => {
  const loadingWrapper = document.getElementById('submit-loader');
  if (show) {
    loadingWrapper.classList.remove('hidden');
    loadingWrapper.classList.add('loader-wrapper');
  } else {
    loadingWrapper.classList.add('hidden');
    loadingWrapper.classList.remove('loader-wrapper');
  }
};

const isNoteworthy = document.getElementById('isNoteworthy');

isNoteworthy.addEventListener('click', (event) => {
  if (event.target.checked) {
    document.getElementById('completionAwardDinero').value = 2500;
    document
      .getElementById('completionAwardDinero')
      .parentElement.querySelector('em').innerHTML = ' ' + 2500;
  } else {
    document.getElementById('completionAwardDinero').value = 1000;
    document
      .getElementById('completionAwardDinero')
      .parentElement.querySelector('em').innerHTML = ' ' + 1000;
  }
});

document.getElementById('submit').addEventListener('keypress', (e) => {
  let key = e.key;
  if (key === 'Enter') {
    e.preventDefault();
  }
});

taskForm.onsubmit = async (e) => {
  e.preventDefault();
  showSubmitLoader();
  const {
    title,
    purpose,
    featureUrl,
    type,
    links,
    endsOn,
    status,
    category,
    level,
    dependsOn,
    assignee,
    participants,
    priority,
    percentCompleted,
    completionAwardDinero,
    completionAwardNeelam,
    lossRateDinero,
    lossRateNeelam,
    isNoteworthy,
  } = getObjectOfFormData(taskForm);

  if (status === StatusType.ASSIGNED && !assignee.trim()) {
    alert('Assignee can not be empty');
    showSubmitLoader(false);
    document.getElementById('assignee').focus();
    return;
  }

  const dataToBeSent = {
    title,
    purpose,
    featureUrl,
    type,
    links: Array.isArray(links) ? links : [links],
    dependsOn: Array.isArray(dependsOn) ? dependsOn : [dependsOn],
    endsOn,
    status,
    priority,
    percentCompleted: Number(percentCompleted),
    completionAward: {
      dinero: Number(completionAwardDinero),
      neelam: Number(completionAwardNeelam),
    },
    lossRate: {
      dinero: Number(lossRateDinero),
      neelam: Number(lossRateNeelam),
    },
    isNoteworthy: isNoteworthy == 'on',
  };

  if (status === StatusType.ASSIGNED) {
    dataToBeSent.startedOn = new Date() / 1000;
  }

  if (!endsOn) {
    delete dataToBeSent.endsOn;
  }

  if (status === StatusType.AVAILABLE) {
    delete dataToBeSent.endsOn;
  }

  if (isDev) {
    delete dataToBeSent.featureUrl;
    delete dataToBeSent.type;
    delete dataToBeSent.participants;

    dataToBeSent.assignee = assignee.trim() ? assignee : ' ';
    dataToBeSent.skills = multiSelect.getSelectedSkills();
  } else {
    if (dataToBeSent.featureUrl.trim() === '') {
      delete dataToBeSent.featureUrl;
    }
    if (dataToBeSent.type == 'feature') {
      dataToBeSent.assignee = assignee.trim() ? assignee : ' ';
    }
    if (dataToBeSent.type == 'group') {
      dataToBeSent.participants = participants.trim()
        ? participants.split(',')
        : [];
    }
  }

  if (dataToBeSent.purpose.trim() === '') {
    delete dataToBeSent.purpose;
  }

  dataToBeSent.links = dataToBeSent.links.filter((link) => link);

  if (dataToBeSent.links.length !== 0) {
    dataToBeSent.links = dataToBeSent.links[0].split(',');
    dataToBeSent.links = dataToBeSent.links.filter((link) => link);
  } else {
    delete dataToBeSent.links;
  }

  dataToBeSent.dependsOn = dataToBeSent.dependsOn.filter(
    (dependOn) => dependOn,
  );
  if (dataToBeSent.dependsOn.length !== 0) {
    dataToBeSent.dependsOn = dataToBeSent.dependsOn[0].split(',');
    dataToBeSent.dependsOn = dataToBeSent.dependsOn.filter(
      (dependOn) => dependOn,
    );
  } else {
    delete dataToBeSent.dependsOn;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/tasks?userStatusFlag=true`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(dataToBeSent),
      headers: {
        'Content-type': 'application/json',
      },
    });

    const result = await response.json();

    if (response.ok) {
      if (!isDev) {
        const body = {
          itemId: result.id,
          itemType: 'task',
          tagPayload: [{ tagId: category, levelId: level }],
        };

        await fetch(`${API_BASE_URL}/items`, {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify(body),
          headers: {
            'Content-type': 'application/json',
          },
        });
      }
      alert(result.message);
      window.location.reload(true);
    }
  } catch (error) {
    alert(`Error: ${error}`);
  } finally {
    showSubmitLoader(false);
  }
};

let addEventToInput = (input, event, fn) => {
  Array.from(input).forEach(function (element) {
    element.addEventListener(event, fn);
  });
};

let wasAssigneeSet = false;

let stateHandle = () => {
  const arrInput = Object.values(input);
  let results = arrInput.filter(function (item) {
    if (
      item.value === '' &&
      item.name !== 'endsOn' &&
      item.name !== 'assignee'
    ) {
      return true;
    } else if (
      item.value === StatusType.ASSIGNED &&
      (wasAssigneeSet === false || assigneeEl.value === '')
    ) {
      return true;
    }
  });

  if (results.length === 0) {
    button.disabled = false;
    document.getElementById('submit').classList.add('active');
    document.getElementById('submit').classList.remove('disabled');
  } else {
    button.disabled = true;
    document.getElementById('submit').classList.add('disabled');
    document.getElementById('submit').classList.remove('active');
  }
};

let hideUnusedField = (radio) => {
  if (isDev) return;

  const assigneeInput = document.getElementById('assigneeInput');
  const participantsInput = document.getElementById('participantsInput');
  if (
    'assignee' === radio &&
    assigneeInput.classList.contains('show-assignee-field')
  ) {
    assigneeInput.style.display = 'flex';
    participantsInput.style.display = 'none';
  } else if ('participants' === radio) {
    participantsInput.style.display = 'flex';
    assigneeInput.style.display = 'none';
  } else {
    participantsInput.style.display = 'none';
    assigneeInput.style.display = 'none';
  }
};

const input = document.getElementsByClassName('input');
const button = document.getElementById('submit');
button.disabled = true;
addEventToInput(input, 'change', stateHandle);

(() => {
  const edits = document.querySelectorAll('.inputBox label.editable');
  const inputs = document.querySelectorAll('.notEditing');
  edits.forEach((edit, index) => {
    const preview = document.createElement('em');
    preview.innerHTML = ' ' + edit.nextElementSibling.value;
    preview.classList.add('preview');
    index === 0
      ? (preview.style = 'text-align:left; margin-top:.5em')
      : (preview.style = 'margin: 0;');
    index === 0 ? edit.parentElement.append(preview) : edit.append(preview);

    const element = document.createElement('span');
    element.innerHTML = 'Edit';
    element.classList.add('edit-button');
    index === 3 ? (element.id = 'statusId') : '';

    element.addEventListener('click', (event) => {
      event.target.classList.toggle('edit-button__active');
      preview.classList.toggle('notEditing');
      const input = event.target.parentElement.nextElementSibling;
      input.classList.toggle('notEditing');
      preview.innerHTML = ' ' + input.value;
    });
    edit.append(element);
  });
})();

const handleDateChange = (event) => {
  const input = event.target;
  const previewDate = document.getElementById('remainingDays').children[0];
  previewDate.innerHTML = !!input.value ? getRemainingDays(input.value) : 14;
};

function handleStatusChange(
  event = { target: { value: StatusType.AVAILABLE } },
) {
  const assignee = document.getElementById('assigneeInput');
  const assigneeEl = document.getElementById('assignee');
  const endsOnWrapper = document.getElementById('endsOnWrapper');
  const featureRadio = document.getElementById('feature');
  if (event.target.value === StatusType.ASSIGNED) {
    setDefaultDates();
    assignee.classList.add('show-assignee-field');
    assignee.style.display = 'none';
    endsOnWrapper.style.display = '';
  } else {
    assignee.classList.remove('show-assignee-field');
    assignee.style.display = 'none';
    endsOnWrapper.style.display = 'none';
    document.getElementById('endsOn').value = '';
    assigneeEl.value = '';
  }
  if (event.target.value === StatusType.ASSIGNED && featureRadio.checked) {
    assignee.style.display = 'flex';
  }
}

document.getElementById('visibity-hidden').classList.remove('visibity-hidden');

const assigneeEl = document.getElementById('assignee');

function debounce(func, delay) {
  let timerId;
  return (...args) => {
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

async function fetchTags() {
  if (isDev) return;

  const response = await fetch(`${API_BASE_URL}/tags`);
  const data = await response.json();
  const { tags } = data;

  const category = document.getElementById('category');

  for (const tag of tags) {
    const option = document.createElement('option');
    option.textContent = tag.name;
    option.setAttribute('value', tag.id);
    category.appendChild(option);
  }
}

async function fetchLevel() {
  if (isDev) return;

  const response = await fetch(`${API_BASE_URL}/levels`);
  const data = await response.json();
  const { levels } = data;

  levels.sort((a, b) => (a.value > b.value ? 1 : -1));

  const leveloption = document.getElementById('level');

  for (const level of levels) {
    const option = document.createElement('option');
    option.text = level.name;
    option.setAttribute('value', level.id);
    leveloption.appendChild(option);
  }
}

async function fetchUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    const data = await response.json();
    usersData = data.users;
  } catch {
    return;
  }
}

fetchTags();
fetchLevel();
fetchUsers();

function filterUsers(searchInput) {
  clearSuggestionList();
  wasAssigneeSet = false;
  if (searchInput.trim() !== '') {
    const matches = usersData.filter((task) => {
      if (task.username) {
        clearUserNotFound();
        return task.username.toLowerCase().includes(searchInput.toLowerCase());
      }
    });
    if (searchInput != '' && !matches.length) {
      const unknownUser = document.createElement('small');
      unknownUser.classList.add('unknownUsers-list');
      unknownUser.innerText = 'User not found';
      const assigneeInput = document.getElementById('assigneeInput');
      assigneeInput.appendChild(unknownUser);
    }
    createSuggestionsList(matches);
  }
}

function clearUserNotFound() {
  const suggestedList = document.querySelectorAll('.unknownUsers-list');
  suggestedList.forEach((suggestion) => {
    suggestion.remove();
  });
}

function createSuggestionsList(matches) {
  const listItems = document.getElementById('list-items');
  if (matches.length) {
    matches.map(({ username, picture }) => {
      const listItem = document.createElement('p');
      const userImage = document.createElement('img');
      userImage.src = picture
        ? `${picture.url}`
        : '../images/No-profile-pic.jpg';
      userImage.alt = `${username}`;
      userImage.classList.add('assignee-image');
      listItem.classList.add('list-item');
      listItem.style.cursor = 'pointer';
      listItem.setAttribute('onclick', `setAssignee('${username}')`);
      listItem.appendChild(userImage);
      listItem.innerHTML += username;
      listItems.appendChild(listItem);
    });
  }
}

function setAssignee(assignee) {
  assigneeEl.value = assignee;
  wasAssigneeSet = true;
  stateHandle();
  clearSuggestionList();
}

function clearSuggestionList() {
  const userNames = document.querySelectorAll('.list-item');
  document.getElementById('suggested-users').classList.add('hidden');
  userNames.forEach((user) => {
    user.remove();
  });
}

function createSuggestedUserLists() {
  const suggestedUsersDiv = document.getElementById('suggested-users');
  const suggestedUsersContainer = document.getElementById(
    'suggested-users-container',
  );

  suggestedUsersContainer.innerHTML = '';
  suggestedUsersDiv.classList.remove('hidden');

  suggestedUsers.forEach((user) => {
    const listItem = document.createElement('p');
    listItem.classList.add('list-item');
    listItem.setAttribute('onclick', `setAssignee('${user.username}')`);
    listItem.innerText = user.username;
    suggestedUsersContainer.appendChild(listItem);
  });
}

assigneeEl.addEventListener(
  'input',
  debounce((event) => filterUsers(event.target.value), 500),
);

assigneeEl.addEventListener('click', createSuggestedUserLists);
