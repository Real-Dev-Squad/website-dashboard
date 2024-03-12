function createElementFromMap(domObjectMap) {
  if (
    !domObjectMap ||
    typeof domObjectMap !== 'object' ||
    !domObjectMap.tagName
  ) {
    throw new Error('Invalid domObjectMap. tagName is required.');
  }
  const el = document.createElement(domObjectMap.tagName);
  for (const [key, value] of Object.entries(domObjectMap)) {
    if (key === 'tagName') {
      continue;
    }
    if (key === 'eventListeners') {
      value.forEach((obj) => {
        el.addEventListener(obj.event, obj.func);
      });
    }
    if (key === 'class') {
      if (Array.isArray(value)) {
        el.classList.add(...value);
      } else {
        el.classList.add(value);
      }
    } else if (key === 'child') {
      el.append(...value);
    } else {
      el[key] = value;
    }
  }

  return el;
}

function getOooQueryParamsString(query) {
  let queryParam = 'dev=true&type=OOO&size=12';
  if (
    query.state !== undefined &&
    query.state !== null &&
    query.state !== 'ALL'
  ) {
    queryParam += `&state=${query.state}`;
  }
  return `?${queryParam}`;
}

function convertDateToReadableStringDate(date, format) {
  if (format === undefined || format === null) {
    format = DEFAULT_DATE_FORMAT;
  }
  if (date !== undefined && date !== null) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(date)
      .toLocaleString('default', options)
      .replace('DD', new Date(date).getDate())
      .replace(
        'MMM',
        new Date(date).toLocaleString('default', { month: 'short' }),
      )
      .replace('YYYY', new Date(date).getFullYear());
  }
  return 'N/A';
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
