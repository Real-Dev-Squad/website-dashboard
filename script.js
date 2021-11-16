const BASE_URL = 'https://api.realdevsquad.com';

function getObjectOfFormData(formId) {
  const object = {};
  const data = new FormData(formId);

  data.forEach((value, key) => {
    if (!Reflect.has(object, key)) {
      if (key === 'startedOn' || key === 'endsOn') {
        let date = new Date(value);
        let myEpoch = String(date.getTime() / 1000.0);
        value = myEpoch;
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

/**
 * Hide/shows the loader of the form submit button
 * @param {Boolean} show whether to show loader or hide
 */
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

const startedDate = document.getElementById('startedOn');
const endDate = document.getElementById('endsOn');
const isNoteworthy = document.getElementById('isNoteworthy');

const setEndDate = (startDate) => {
  // const startTimeEpoch = new Date(startDate).getTime();
  // const endTime = new Date(startTimeEpoch + 1000 * 60 * 60 * 24 * 7);
  // const dd = String(endTime.getDate()).padStart(2, '0');
  // const mm = String(endTime.getMonth() + 1).padStart(2, '0');
  // const yyyy = endTime.getFullYear();

  const startTime = new Date(startDate);
  const startTimeArray = startTime.toLocaleDateString().split('/');

  const endTime = new Date(startTimeArray[2], +startTimeArray[0] - 1, +startTimeArray[1] + 7);
  endTimeArray = endTime.toLocaleDateString().split('/');
  endDate.value = `${endTimeArray[2]}-${endTimeArray[0].padStart(2, '0')}-${endTimeArray[1].padStart(2, '0')}`;
  
  const remainingDays = document.getElementById('remainingDays').children[0];
  remainingDays.innerHTML = Math.round((endTime - startTime)/(1000*60*60*24));
};

endDate.addEventListener('change', (event) => {
  if (event.target.value) {
    const remainingDays = document.getElementById('remainingDays').children[0];
    if (startedDate.value > endDate.value || startedDate.value === endDate.value) {
      alert('End Date should be greater than the Start Date');
      endDate.value = `${startedDate.value.slice(0, startedDate.value.length-1)}${+startedDate.value[startedDate.value.length-1] + 1}` ;
      remainingDays.innerHTML = 1;
    }

    const startTime = new Date(startedDate.value);
    const endTime = new Date(endDate.value);
    remainingDays.innerHTML = Math.round((endTime - startTime)/(1000*60*60*24));
  }
});

startedDate.addEventListener('change', function (event) {
  if (event.target.value) {
    setEndDate(event.target.value);
  }
});

isNoteworthy.addEventListener('click', (event) => {
  if(event.target.checked) {
    document.getElementById('completionAwardDinero').value = 2500;
  } else {
    document.getElementById('completionAwardDinero').value = 1000;
  }
})

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
    startedOn,
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

  const dataToBeSent = {
    title,
    purpose,
    featureUrl,
    type,
    links: Array.isArray(links) ? links : [links],
    endsOn: Number(endsOn),
    startedOn: Number(startedOn),
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

  if (dataToBeSent.type == 'feature') {
    dataToBeSent.assignee = assignee;
  }

  if (dataToBeSent.type == 'group') {
    dataToBeSent.participants = participants.trim().split(',');
  }

  try {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(dataToBeSent),
      headers: {
        'Content-type': 'application/json',
      },
    });

    const result = await response.json();

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

  let results = arrInput.filter(function (item, index, array) {
    if (item.value === '') {
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
button.disabled = true; //setting button state to disabled
addEventToInput(input, 'change', stateHandle);

const currentDate = new Date();
const dd = String(currentDate.getDate()).padStart(2, '0');
const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
const yyyy = currentDate.getFullYear();

const today = `${yyyy}-${mm}-${dd}`;
startedDate.value = today;
setEndDate(currentDate);

const edits = document.querySelectorAll('.inputBox label.editable')
const inputs = document.querySelectorAll('.notEditing')

edits.forEach((edit, index) => {
  const preview = document.createElement('em');
  preview.innerHTML = ' ' + edit.nextElementSibling.value;
  index ===  0 ?  preview.style = "font-size:14px; font-weight: 500; white-space: pre-wrap; text-align:left; margin-top:.5em": preview.style = "font-size:14px; font-weight: 500; white-space: pre-wrap;"
  index === 0 ? edit.parentElement.append(preview) : edit.append(preview);

  const element = document.createElement('span')
  element.innerHTML = 'Edit'
  element.style = `
    width: fit-content;
    height: fit-content;
    position: relative;
    float: right;
    right:  5px;
    cursor: pointer;`

  element.addEventListener('click', (event) =>{
    preview.classList.toggle('notEditing');
    const input = event.target.parentElement.nextElementSibling;
    input.classList.toggle('notEditing');
    preview.innerHTML = ' ' + input.value;
  })
  edit.append(element);
  console.log(edit.nextElementSibling)
})