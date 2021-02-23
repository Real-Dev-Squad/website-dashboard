const BASE_URL = 'https://api.realdevsquad.com';

function getObjectOfFormData(formId) {
  const object = {};
  const data = new FormData(formId);

  data.forEach((value, key) => {
    if (!Reflect.has(object, key)) {
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
    ownerId,
    percentCompleted,
    completionAwardGold,
    completionAwardSilver,
    completionAwardBronze,
    lossRateGold,
    lossRateSilver,
    lossRateBronze,
    isNoteworthy,
  } = getObjectOfFormData(taskForm)

  const dataToBeSent = {
    title,
    purpose,
    featureUrl,
    type,
    links: (Array.isArray(links))? links : [links],
    endsOn,
    startedOn,
    status,
    ownerId,
    percentCompleted,
    completionAward: {
      gold: completionAwardGold,
      silver: completionAwardSilver,
      bronze: completionAwardBronze
    },
    lossRate: {
      gold: lossRateGold,
      silver: lossRateSilver,
      bronze: lossRateBronze,
    },
    isNoteworthy: isNoteworthy || false,
  }
  try {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      body: JSON.stringify(dataToBeSent),
      headers: {
        'Content-type': 'application/json'
      }
    });
  
    const result = await response.json();
  
    alert(result.message);
  } catch (error) {
    alert(`Error: ${error}`)
  }
};