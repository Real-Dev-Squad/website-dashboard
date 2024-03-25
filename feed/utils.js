async function getActivityFeedData(query = {}, nextLink) {
  validateQuery(query);
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
  const queryParams = {
    dev: true,
    format: 'feed',
    type: getLogTypesFromCategory(query?.category),
  };
  const queryString = new URLSearchParams(queryParams).toString();
  return `?${queryString}`;
}

function getLogTypesFromCategory(category) {
  switch (category) {
    case CATEGORY.ALL:
      return [
        logType.TASK,
        logType.EXTENSION_REQUESTS,
        logType.TASK_REQUESTS,
        logType.REQUEST_CREATED,
      ].join(',');
    case CATEGORY.TASK:
      return logType.TASK;
    case CATEGORY.EXTENSION_REQUESTS:
      return logType.EXTENSION_REQUESTS;
    case CATEGORY.TASK_REQUESTS:
      return logType.TASK_REQUESTS;
    case CATEGORY.OOO:
      return logType.REQUEST_CREATED;
    default:
      return '';
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

function addErrorElement(container, error) {
  const errorHeading = createElement({
    type: 'h4',
    innerText: `Error: An error occurred while fetching logs. Please try again later.`,
  });

  container.appendChild(errorHeading);
  if (error) {
    const errorText = createElement({
      type: 'p',
      innerText: `${error}`,
    });
    container.appendChild(errorText);
  }
}

function validateQuery(queryObject) {
  const expectedParams = ['category'];
  for (const param of expectedParams) {
    if (!(param in queryObject)) {
      throw new Error(`Missing parameter: ${param}`);
    }
  }
  return true;
}

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleString();
}

function formatUserAction(data, actionText) {
  const user = data?.user;
  return `<strong>${user}</strong> ${actionText}`;
}

function formatLinkWithTitle(link, title) {
  return `<a href=${link} target="_blank">${title ?? link}</a>`;
}

function describeChange(data) {
  const changeTextParts = [];

  if (data.newTitle && data.oldTitle) {
    changeTextParts.push(`title from "${data.oldTitle}" to "${data.newTitle}"`);
  }

  if (data.newReason && data.oldReason) {
    changeTextParts.push(
      `reason from "${data.oldReason}" to "${data.newReason}"`,
    );
  }

  if (data.newEndsOn && data.oldEndsOn) {
    changeTextParts.push(
      `endsOn date from "${formatDate(data.oldEndsOn)}" to "${formatDate(
        data.newEndsOn,
      )}"`,
    );
  }

  return changeTextParts.length
    ? `changed ${changeTextParts.join(', ')}` +
        ` for a extension request of task.`
    : '';
}

function truncateWithEllipsis(text, maxLength = 120) {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}
