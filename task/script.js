const API_BASE_URL = window.API_BASE_URL;
const suggestedUsers = [];
const allUser = [];
const category = document.getElementById('category');

category.addEventListener('change', async () => {
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
let membersData = [];

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
  if (document.getElementById('status').value === 'ASSIGNED') {
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
    document.getElementById('status').value === 'ASSIGNED';

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

  if (status === 'ASSIGNED' && !assignee.trim()) {
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

  if (status === 'ASSIGNED') {
    dataToBeSent.startedOn = new Date() / 1000;
  }

  if (!endsOn) {
    delete dataToBeSent.endsOn;
  }

  if (status === 'AVIALABLE') {
    delete dataToBeSent.endsOn;
  }

  if (dataToBeSent.type == 'feature') {
    dataToBeSent.assignee = assignee.trim() ? assignee : ' ';
  }

  if (dataToBeSent.type == 'group') {
    dataToBeSent.participants = participants.trim()
      ? participants.split(',')
      : [];
  }

  if (dataToBeSent.purpose.trim() === '') {
    delete dataToBeSent.purpose;
  }

  if (dataToBeSent.featureUrl.trim() === '') {
    delete dataToBeSent.featureUrl;
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
      item.value === 'ASSIGNED' &&
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

function handleStatusChange(event = { target: { value: 'AVAILABLE' } }) {
  const assignee = document.getElementById('assigneeInput');
  const assigneeEl = document.getElementById('assignee');
  const endsOnWrapper = document.getElementById('endsOnWrapper');
  const featureRadio = document.getElementById('feature');
  if (event.target.value === 'ASSIGNED') {
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
  if (event.target.value === 'ASSIGNED' && featureRadio.checked) {
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

async function fetchMembers() {
  try {
    const response = await fetch(`${API_BASE_URL}/members`);
    const data = await response.json();
    membersData = data.members;
  } catch {
    return;
  }
}

fetchTags();
fetchLevel();
fetchMembers();

function filterMembers(searchInput) {
  clearSuggestionList();
  wasAssigneeSet = false;
  if (searchInput.trim() !== '') {
    const matches = membersData.filter((task) => {
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
  debounce((event) => filterMembers(event.target.value), 500),
);

assigneeEl.addEventListener('click', createSuggestedUserLists);
