function getQueryParamsString(requestType, query) {
  const params = new URLSearchParams({
    type: requestType,
    size: '12',
  });
  if (requestType !== OOO_REQUEST_TYPE) {
    params.set('dev', 'true');
  }

  if (query.state && query.state !== 'ALL') {
    params.set('state', query.state);
  }

  if (query.requestedBy) {
    params.set('requestedBy', query.requestedBy);
  }

  return `?${params.toString()}`;
}

function getFullNameOfUser(user) {
  if (!user || typeof user !== 'object') {
    return 'N/A';
  }
  const firstName = user.first_name || 'N/A';
  const lastName = user.last_name || '';
  return (
    firstName.charAt(0).toUpperCase() +
    firstName.slice(1).toLowerCase() +
    ' ' +
    lastName.charAt(0).toUpperCase() +
    lastName.slice(1).toLowerCase()
  );
}

function extractQueryParameters(url) {
  const searchParams = new URLSearchParams(url.split('?')[1]);
  const parameters = {};

  for (const [key, value] of searchParams.entries()) {
    parameters[key] = value;
  }
  return parameters;
}

async function getInDiscordUserList() {
  try {
    const res = await fetch(`${API_BASE_URL}/users/search?role=in_discord`, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
    });
    const data = await res.json();
    return data.users;
  } catch (error) {
    console.log(error);
  }
}

const addSpinner = (container) => {
  const spinner = createElementFromMap({
    tagName: 'div',
    class: 'spinner',
  });

  container.append(spinner);

  function removeSpinner() {
    spinner.remove();
  }

  return removeSpinner;
};

async function getRequestDetailsById(requestId) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/requests?dev=true&id=${requestId}`,
      {
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
        },
      },
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

function addRadioButton(labelText, value, groupName) {
  const group = document.getElementById('filterOptionsContainer');
  const label = document.createElement('label');
  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = groupName;
  radio.value = value;
  label.innerHTML = radio.outerHTML + '&nbsp;' + labelText;
  label.classList.add('radio-label');
  label.appendChild(document.createElement('br'));
  group.appendChild(label);
}

function deselectRadioButtons() {
  const radioButtons = document.querySelectorAll(`input[name="status-filter"]`);
  radioButtons.forEach((radioButton) => {
    radioButton.checked = false;
  });
}

async function getUsersByUsername(username) {
  try {
    const res = await fetch(`${API_BASE_URL}/users?search=${username}&size=5`, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data.users;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}
