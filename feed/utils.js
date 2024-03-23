async function getActivityFeedData(query = {}, nextLink) {
  let finalUrl =
    API_BASE_URL + (nextLink || '/logs' + generateActivityFeedParams(query));
  const res = await fetch(finalUrl, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  return await res.json();
}

function generateActivityFeedParams(query) {
  let queryParam = 'dev=true&format=feed';
  if (query?.category) queryParam += getLogTypesFromCategory(query?.category);
  return `?${queryParam}`;
}

function getLogTypesFromCategory(category) {
  switch (category) {
    case CATEGORY.ALL:
      return '';
    case CATEGORY.TASK:
      return `&type=${logType.TASK}`;
    case CATEGORY.EXTENSION_REQUESTS:
      return `&type=${logType.EXTENSION_REQUESTS}`;
    case CATEGORY.TASK_REQUESTS:
      return `&type=${logType.TASK_REQUESTS}`;
    case CATEGORY.OOO:
      return `&type=${logType.REQUEST_CREATED},${logType.REQUEST_REJECTED},${logType.REQUEST_APPROVED}`;
  }
}

function addEmptyPageMessage(container) {
  const emptyPageMessage = createElement({
    type: 'p',
    attributes: { class: 'page-message' },
    innerText: 'No logs to show!',
  });
  container.appendChild(emptyPageMessage);
}

function addErrorElement(container) {
  const errorHeading = createElement({
    type: 'h2',
    innerText: 'Something went wrong, Please reload',
  });
  container.appendChild(errorHeading);
}
