function generateActivityFeedParams(query) {
  const queryParams = {
    dev: true,
    format: 'feed',
    type: getLogTypesFromCategory(query?.category),
    username: query.username || undefined,
    startDate: query.startDate
      ? Math.floor(new Date(query.startDate).getTime() / 1000)
      : undefined,
    endDate: query.endDate
      ? Math.floor(new Date(query.endDate).getTime() / 1000)
      : undefined,
  };
  Object.keys(queryParams).forEach((key) => {
    if (queryParams[key] === undefined) {
      delete queryParams[key];
    }
  });

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

function showMessage(container, errorMsg) {
  if (errorMsg) {
    const errorHeading = createElement({
      type: 'h4',
      innerText: errorMsg,
    });

    container.appendChild(errorHeading);
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

function generateQueryParams(params) {
  return Object.entries(params)
    .flatMap(([key, value]) =>
      Array.isArray(value)
        ? value.map(
            (v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`,
          )
        : `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');
}

function refreshFeedWithQuery(query) {
  changeFilter();
  populateActivityFeed(query);
}

function refreshFeed() {
  const query = {
    category: currentCategory,
    ...activeFilters,
  };

  changeFilter();
  populateActivityFeed(query);
}
