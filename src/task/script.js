const API_BASE_URL = window.API_BASE_URL;

const getRemainingDays = (selectedDateInString) => {
  const selectedDateInStringArray = selectedDateInString.split('-');
  const month = selectedDateInStringArray[1];
  if (month.length === 2 && month.split('')[0] === '0') {
    selectedDateInStringArray[1] = selectedDateInStringArray[1].split('')[1];
  }
  selectedDateInString = selectedDateInStringArray.join('-');
  const selectedDate = new Date(selectedDateInString);
  const currentDate = new Date();
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
    assignee,
    participants,
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
    endsOn,
    status,
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

  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(dataToBeSent),
      headers: {
        'Content-type': 'application/json',
      },
    });

    const result = await response.json();

    if (response.status>=200 && response.status<400) {
      window.location.reload(true);
    }
    alert(result.message);
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

let stateHandle = () => {
  const arrInput = Object.values(input);
  let results = arrInput.filter(function (item) {
    if (item.value === '' && item.name !== 'endsOn') {
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
  if ('assignee' === radio) {
    document.getElementById('assigneeInput').style.display = 'flex';
  } else {
    document.getElementById('assigneeInput').style.display = 'none';
  }

  if ('participants' === radio) {
    document.getElementById('participantsInput').style.display = 'flex';
  } else {
    document.getElementById('participantsInput').style.display = 'none';
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
  const endsOnWrapper = document.getElementById('endsOnWrapper');
  if (event.target.value === 'ASSIGNED') {
    setDefaultDates();
    assignee.style.display = '';
    endsOnWrapper.style.display = '';
  } else {
    assignee.style.display = 'none';
    endsOnWrapper.style.display = 'none';
    document.getElementById('endsOn').value = '';
  }
}

document.getElementById('visibity-hidden').classList.remove('visibity-hidden');
