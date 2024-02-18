function createCustomElement(domObjectMap) {
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

function getQueryParamsString(query) {
  let queryParam = 'type=OOO';
  if (
    query.state !== undefined &&
    query.state !== null &&
    query.state !== 'ALL'
  ) {
    queryParam += `&state=${query.state}`;
  }
  return '?' + queryParam.toString();
}

function convertDateToReadableStringDate(date) {
  if (date !== undefined && date !== null) {
    return (
      new Date(date).getDate() +
      ' ' +
      new Date(date).toLocaleString('default', { month: 'short' }) +
      ' ' +
      new Date(date).getFullYear()
    );
  }
  return 'NA';
}

function getFullNameOfUser(user) {
  if (user === undefined || user === null) {
    return 'NA';
  }
  return (
    user?.first_name?.charAt(0).toUpperCase() +
    user?.first_name?.slice(1).toLowerCase() +
    ' ' +
    user?.last_name?.charAt(0).toUpperCase() +
    user?.last_name?.slice(1).toLowerCase()
  );
}
