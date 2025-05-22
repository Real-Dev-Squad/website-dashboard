function getTimeInMilliseconds(time, isInSeconds) {
  return isInSeconds ? time * 1000 : time;
}

const getRequestColor = (deadline, createdTime) => {
  const wasDeadlineBreached = createdTime > deadline;
  if (wasDeadlineBreached) {
    return 'red-text';
  }
  const days = Math.floor((deadline - createdTime) / (1000 * 60 * 60 * 24));
  if (days > DEADLINE_WARNING_THRESHOLD_DAYS) {
    return 'green-text';
  }
  return 'orange-text';
};

const formatToFullDate = (timestamp, locale = 'en-US') => {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    hour12: true,
  };
  return new Intl.DateTimeFormat(locale, options).format(new Date(timestamp));
};

const getTwoDigitDate = (timestamp, isInSeconds = false) => {
  const normalizedTime = getTimeInMilliseconds(timestamp, isInSeconds);

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(normalizedTime));
};

const formatToDateOnly = (milliseconds) => {
  const date = new Date(milliseconds);
  return date.toISOString().split('T')[0];
};

async function addDelay(milliSeconds) {
  await new Promise((resolve) => setTimeout(resolve, milliSeconds));
}

function getFormEntries(formData) {
  if (!formData) return {};
  return Object.fromEntries(formData.entries());
}

const addLoadingSpinner = (container) => {
  if (container.querySelector('.loading-spinner')) {
    return () => {};
  }

  const spinner = createElement({
    type: 'div',
    attributes: {
      class: 'loading-spinner',
      role: 'alert',
      'aria-live': 'polite',
      'aria-busy': 'true',
      'aria-label': 'Loading, please wait',
    },
  });

  container.append(spinner);

  function removeSpinner() {
    spinner.remove();
  }

  return removeSpinner;
};

const toggleAccordionPanel = (panel) => {
  const accordion = panel.previousElementSibling;
  if (!accordion) return;

  const isExpanded = accordion.classList.contains('active');

  if (isExpanded) {
    accordion.classList.remove('active');
    panel.style.maxHeight = null;
  } else {
    document.querySelectorAll('.accordion.active').forEach((el) => {
      el.classList.remove('active');
      el.nextElementSibling?.style &&
        (el.nextElementSibling.style.maxHeight = null);
    });

    accordion.classList.add('active');
    panel.style.maxHeight = `${panel.scrollHeight}px`;
  }
};

const expandAccordionPanel = (panel) => {
  panel.style.maxHeight = `${panel.scrollHeight}px`;
};

function showSuccessHighlight(element) {
  element.classList.add('green-card');
  setTimeout(() => element.classList.remove('green-card'), 1000);
}

function showErrorHighlight(element) {
  element.classList.add('red-card');
  setTimeout(() => element.classList.remove('red-card'), 1000);
}

async function updateRequestStatus({ id, body, isExtensionRequest }) {
  let url;
  let method;
  if (isExtensionRequest) {
    url = `${API_BASE_URL}/extension-requests/${id}/status`;
    method = 'PATCH';
  } else {
    url = `${API_BASE_URL}/requests/${id}`;
    method = 'PUT';
  }

  try {
    const res = await fetch(url, {
      credentials: 'include',
      method,
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(ErrorMessage.UPDATE_REQUEST);
    }
    return await res.json();
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
}

async function removeCard(element, elementClass, parentContainer) {
  element.classList.add(elementClass);
  await addDelay(CARD_REMOVAL_INITIAL_DELAY_MS);

  const height = element.scrollHeight;

  const animation = element.animate(
    [
      { height: `${height}px`, opacity: 1 },
      { height: `${Math.round(height * 0.5)}px`, opacity: 0.2 },
      {
        height: `${Math.round(height * 0.2)}px`,
        opacity: 0,
        margin: 0,
        padding: '1rem',
      },
      { height: '0', opacity: 0, margin: 0, padding: 0 },
    ],
    {
      duration: CARD_REMOVAL_ANIMATION_DURATION_MS,
      easing: CARD_REMOVAL_ANIMATION_EASING,
    },
  );

  element.style.overflow = 'hidden';

  await animation.finished;

  element.remove();

  if (parentContainer.innerHTML.trim() === '') {
    addEmptyPageMessage(parentContainer);
  }
}

function createSummarySection({
  isExtensionRequest,
  isDeadLineCrossed,
  deadlineDays,
  data,
  oldEndsOn,
  isStatusPending,
}) {
  const summaryContainer = createElement({
    type: 'div',
    attributes: { class: 'summary-container' },
  });

  const taskDetailsContainer = createElement({
    type: 'div',
    attributes: { class: 'task-details-container' },
  });
  summaryContainer.append(taskDetailsContainer);

  const statusSiteLink = createElement({
    type: 'a',
    attributes: {
      class: 'external-link skeleton-link',
      'data-testid': 'external-link skeleton-link',
      target: '_blank',
      'aria-label': 'Open task details on status site',
    },
  });
  const taskTitle = createElement({
    type: 'span',
    attributes: { class: 'task-title' },
    innerText: 'Task: ',
  });

  const deadlineContainer = createElement({
    type: 'div',
    attributes: { id: 'deadline-container' },
  });
  const requestTypeContainer = createElement({
    type: 'div',
    attributes: {
      id: 'requestType-container',
      'data-testid': 'request-type-container',
    },
  });
  taskTitle.append(statusSiteLink);

  if (isExtensionRequest) {
    taskDetailsContainer.append(taskTitle, deadlineContainer);
  } else {
    taskDetailsContainer.append(requestTypeContainer);
  }

  const deadlineText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: `Deadline${isDeadLineCrossed ? ' ' : ' in '}`,
  });

  const requestType = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Request Type ',
  });

  const deadlineValue = createElement({
    type: 'span',
    innerText: `${deadlineDays}`,
    attributes: {
      class: `tooltip-container ${
        isDeadLineCrossed && isStatusPending ? 'red-text' : ''
      }`,
    },
  });

  const requestTypeText = createElement({
    type: 'span',
    attributes: {
      'data-testid': 'request-type',
    },
    innerText: data?.type,
  });

  const deadlineTooltip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: `${formatToFullDate(oldEndsOn)}`,
  });

  deadlineValue.append(deadlineTooltip);
  requestTypeContainer.append(requestType, requestTypeText);
  deadlineContainer.append(deadlineText, deadlineValue);

  return { summaryContainer, taskDetailsContainer, statusSiteLink };
}

function createTextBlockContainer(data, isForReasonComponent) {
  const container = createElement({
    type: 'div',
    attributes: {
      'data-testid': isForReasonComponent
        ? 'request-reason-container'
        : 'admin-info-and-status',
    },
  });

  const title = createElement({
    type: 'span',
    attributes: {
      class: 'panel-title',
    },
    innerText: isForReasonComponent ? 'Reason' : 'Comment',
  });

  const paragraph = createElement({
    type: 'p',
    attributes: {
      class: 'text-block-content',
      'data-testid': isForReasonComponent ? 'request-reason' : 'request-remark',
    },
    innerText: isForReasonComponent ? data.reason : data.message,
  });

  const textAreaInput = createElement({
    type: 'textarea',
    attributes: {
      class: 'input-text-area hidden',
      id: 'reason',
      name: 'reason',
      'data-testid': 'reason-input-text-area',
    },
    value: data.reason,
  });

  const inputError = createElement({
    type: 'span',
    attributes: {
      class: 'input-error red-text hidden',
      'data-testid': 'reason-input-error',
    },
    innerText: 'Reason is required',
  });

  const detailsLine = createElement({
    type: 'span',
    attributes: { class: 'details-line' },
  });

  if (isForReasonComponent) {
    container.append(title, detailsLine, textAreaInput, inputError, paragraph);
  } else {
    container.append(title, detailsLine, paragraph);
  }

  return {
    container,
    textAreaInput,
    inputError,
    paragraph,
  };
}

function createDateContainer(
  isExtensionRequest,
  newDeadlineDays,
  isNewDeadLineCrossed,
  newEndsOnValue,
  requestDays,
  oldEndsOn,
) {
  const datesContainer = createElement({
    type: 'div',
    attributes: { class: 'dates-container' },
  });
  const datesDetailsContainer = createElement({
    type: 'div',
    attributes: { class: 'details-container' },
  });

  const requestDetailsHeading = createElement({
    type: 'span',
    attributes: { class: 'details-heading' },
    innerText: isExtensionRequest ? 'Extension Details' : 'Request Details',
  });

  const requestDetailsLine = createElement({
    type: 'span',
    attributes: { class: 'details-line' },
  });

  const newDeadlineContainer = createElement({
    type: 'div',
    attributes: { id: 'new-deadline-container' },
  });

  const newDeadlineText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: `${
      isExtensionRequest
        ? `New deadline${isNewDeadLineCrossed ? ' ' : ' in '}`
        : 'Until'
    }`,
  });

  const newDeadlineValue = createElement({
    type: 'span',
    attributes: { class: 'requested-day tooltip-container' },
    innerText: ` ${newDeadlineDays}`,
  });

  const requestInput = createElement({
    type: 'input',
    attributes: {
      class: 'date-input hidden',
      type: 'date',
      name: 'newEndsOn',
      id: 'newEndsOn',
      min: formatToDateOnly(Date.now()),
      oninput: 'this.blur()',
      value: formatToDateOnly(
        getTimeInMilliseconds(newEndsOnValue, isExtensionRequest),
      ),
      'data-testid': 'request-input',
    },
  });
  const requestInputError = createElement({
    type: 'div',
    attributes: {
      class: 'request-input-error hidden',
      'data-testid': 'request-input-error',
    },
    innerText: "Past date can't be the new deadline",
  });

  const requestForContainer = createElement({
    type: 'div',
    attributes: { id: 'request-container' },
  });

  const requestForText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Extend by ',
  });

  const requestForValue = createElement({
    type: 'span',
    attributes: { class: 'tooltip-container' },
    innerText: ` +${requestDays}`,
  });

  const fromDateContainer = createElement({
    type: 'div',
  });

  const fromDateText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'From ',
  });

  const fromDateValue = createElement({
    type: 'span',
    attributes: { class: 'tooltip-container' },
    innerText: getTwoDigitDate(oldEndsOn),
  });

  const fromDateValueToolTip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: formatToFullDate(oldEndsOn),
  });

  datesDetailsContainer.append(requestDetailsHeading, requestDetailsLine);
  newDeadlineContainer.append(
    newDeadlineText,
    newDeadlineValue,
    requestInput,
    requestInputError,
  );
  requestForContainer.append(requestForText, requestForValue);
  fromDateContainer.append(fromDateText, fromDateValue);
  fromDateValue.append(fromDateValueToolTip);
  datesContainer.append(datesDetailsContainer);

  if (isExtensionRequest) {
    datesContainer.append(newDeadlineContainer, requestForContainer);
  } else {
    datesContainer.append(fromDateContainer, newDeadlineContainer);
  }

  return {
    datesContainer,
    newDeadlineValue,
    requestInput,
    requestInputError,
    requestForValue,
  };
}
