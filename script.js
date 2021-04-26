const BASE_URL = "https://api.realdevsquad.com";

function getObjectOfFormData(formId) {
  const object = {};
  const data = new FormData(formId);

  data.forEach((value, key) => {
    if (!Reflect.has(object, key)) {
      if (key === "startedOn" || key === "endsOn") {
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

function setEndDate(startDate) {
  const startTimeEpoch = new Date(startDate).getTime();
  const endTime = new Date(startTimeEpoch + 1000 * 60 * 60 * 24 * 7);
  const dd = String(endTime.getDate()).padStart(2, "0");
  const mm = String(endTime.getMonth() + 1).padStart(2, "0");
  const yyyy = endTime.getFullYear();

  document.getElementById("endsOn").value = `${yyyy}-${mm}-${dd}`;
}
document.getElementById("startedOn").addEventListener("change", function (event) {
  if (event.target.value) {
    setEndDate(event.target.value);
  }
})

taskForm.onsubmit = async (e) => {
  e.preventDefault();
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
    endsOn,
    startedOn,
    status,
    percentCompleted,
    completionAward: {
      dinero: completionAwardDinero,
      neelam: completionAwardNeelam,
    },
    lossRate: {
      dinero: lossRateDinero,
      neelam: lossRateNeelam,
    },
    isNoteworthy: (isNoteworthy == 'on'),
  };

  if (dataToBeSent.type == 'feature') {
    dataToBeSent.assignee = assignee;
  }

  if (dataToBeSent.type == 'group') {
    dataToBeSent.participants = participants.trim().split(',');
  }

  try {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(dataToBeSent),
      headers: {
        "Content-type": "application/json",
      },
    });

    const result = await response.json();

    alert(result.message);
  } catch (error) {
    alert(`Error: ${error}`);
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
    if (item.value === "") {
      return true;
    }
  });

  if (results.length === 0) {
    button.disabled = false;
    document.getElementById("submit").classList.add("active");
    document.getElementById("submit").classList.remove("disabled");
  } else {
    button.disabled = true;
    document.getElementById("submit").classList.add("disabled");
    document.getElementById("submit").classList.remove("active");
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
}

const input = document.getElementsByClassName("input");

const button = document.getElementById("submit");
button.disabled = true; //setting button state to disabled
addEventToInput(input, "change", stateHandle);

const currentDate = new Date();
const dd = String(currentDate.getDate()).padStart(2, "0");
const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
const yyyy = currentDate.getFullYear();

today = `${yyyy}-${mm}-${dd}`;
document.getElementById("startedOn").value = today;
setEndDate(currentDate);
