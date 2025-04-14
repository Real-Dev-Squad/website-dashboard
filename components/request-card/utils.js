function normalizeToMilliseconds(time, isExtensionRequest) {
  return isExtensionRequest ? time * 1000 : time;
}
const getRequestColor = (deadline, createdTime) => {
  const wasDeadlineBreached = createdTime > deadline;
  if (wasDeadlineBreached) {
    return 'red-text';
  }
  const days = Math.floor((deadline - createdTime) / (1000 * 60 * 60 * 24));
  if (days > 3) {
    return 'green-text';
  }
  return 'orange-text';
};
const formatToFullDate = (timestamp) => {
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
  return new Intl.DateTimeFormat('en-US', options).format(new Date(timestamp));
};
const getTwoDigitDate = (timestamp, isInSeconds = false) => {
  const normalizedTime = normalizeToMilliseconds(timestamp, isInSeconds);

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(normalizedTime));
};
function formatToDateOnly(milliseconds) {
  const date = new Date(milliseconds);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
}
function getFormEntries(formData) {
  if (!formData) return;
  const result = {};
  for (const [key, value] of formData.entries()) {
    result[key] = value;
  }
  return result;
}
const addLoadingSpinner = (container) => {
  const spinner = createElement({
    type: 'div',
    attributes: { class: 'loading-spinner' },
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
    panel.style.maxHeight = panel.scrollHeight + 'px';
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
    url = `${API_BASE_URL}/requests/${id}?dev=true`;
    method = 'PUT';
  }

  const res = await fetch(url, {
    credentials: 'include',
    method,
    body: JSON.stringify(body),
    headers: {
      'Content-type': 'application/json',
    },
  });

  if (res.status < 200 || res.status > 300) {
    throw new Error('Update failed.');
  }

  return await res.json();
}
async function removeCard(element, elementClass, parentContainer) {
  element.classList.add(elementClass);
  await addDelay(800);
  element.style.overflow = 'hidden';
  element
    .animate(
      [
        {
          height: `${element.scrollHeight}px`,
          opacity: 1,
        },
        {
          height: `${Math.round(element.scrollHeight * 0.5)}px`,
          opacity: 0.2,
        },
        {
          height: `${Math.round(element.scrollHeight * 0.2)}px`,
          opacity: 0,
          margin: 0,
          padding: '1rem',
        },
        {
          height: 0,
          opacity: 0,
          margin: 0,
          padding: 0,
        },
      ],
      {
        duration: 800,
        easing: 'ease-out',
      },
    )
    .addEventListener('finish', () => {
      element.style.overflow = '';
      element.remove();
      if (parentContainer.innerHTML === '') {
        addEmptyPageMessage(parentContainer);
      }
    });
}
function createSummarySection({
  isExtensionRequest,
  isDeadLineCrossed,
  deadlineDays,
  data,
  oldEndsOnValue,
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
  summaryContainer.appendChild(taskDetailsContainer);

  const statusSiteLink = createElement({
    type: 'a',
    attributes: {
      class: 'external-link skeleton-link',
      'data-testid': 'external-link skeleton-link',
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
    attributes: { id: 'requestType-container' },
  });
  taskTitle.appendChild(statusSiteLink);

  if (isExtensionRequest) {
    taskDetailsContainer.appendChild(taskTitle);
    taskDetailsContainer.appendChild(deadlineContainer);
  } else {
    taskDetailsContainer.appendChild(requestTypeContainer);
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

  requestTypeContainer.appendChild(requestType);
  deadlineContainer.appendChild(deadlineText);

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
    innerText: data?.type,
  });

  deadlineContainer.appendChild(deadlineValue);
  requestTypeContainer.appendChild(requestTypeText);
  const deadlineTooltip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: `${formatToFullDate(
      normalizeToMilliseconds(oldEndsOnValue, isExtensionRequest),
    )}`,
  });
  deadlineValue.appendChild(deadlineTooltip);

  return { summaryContainer, taskDetailsContainer, statusSiteLink };
}

function createTextBlockContainer(data, isForReasonComponent) {
  const container = createElement({ type: 'div' });

  const title = createElement({
    type: 'span',
    attributes: { class: 'panel-title' },
    innerText: isForReasonComponent ? 'Reason' : 'Comment',
  });

  const paragraph = createElement({
    type: 'p',
    attributes: { class: 'text-block-content' },
    innerText: isForReasonComponent ? data.reason : data.message,
  });

  const textAreaInput = createElement({
    type: 'textarea',
    attributes: {
      class: 'input-text-area hidden',
      id: 'reason',
      name: 'reason',
      'data-testid': 'reason-input',
    },
    innerText: data.reason,
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
    container.appendChild(title);
    container.appendChild(detailsLine);
    container.appendChild(textAreaInput);
    container.appendChild(inputError);
    container.appendChild(paragraph);
  } else {
    container.appendChild(title);
    container.appendChild(detailsLine);
    container.appendChild(paragraph);
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
  oldEndsOnValue,
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
      oninput: 'this.blur()',
      value: formatToDateOnly(
        normalizeToMilliseconds(newEndsOnValue, isExtensionRequest),
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
    innerText: getTwoDigitDate(oldEndsOnValue),
  });

  const fromDateValueToolTip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: formatToFullDate(
      normalizeToMilliseconds(oldEndsOnValue, isExtensionRequest),
    ),
  });

  datesDetailsContainer.appendChild(requestDetailsHeading);
  datesDetailsContainer.appendChild(requestDetailsLine);

  newDeadlineContainer.appendChild(newDeadlineText);
  newDeadlineContainer.appendChild(newDeadlineValue);
  newDeadlineContainer.appendChild(requestInput);
  newDeadlineContainer.appendChild(requestInputError);

  requestForContainer.appendChild(requestForText);
  requestForContainer.appendChild(requestForValue);

  fromDateContainer.appendChild(fromDateText);
  fromDateContainer.appendChild(fromDateValue);

  fromDateValue.appendChild(fromDateValueToolTip);

  datesContainer.appendChild(datesDetailsContainer);

  if (isExtensionRequest) {
    datesContainer.appendChild(newDeadlineContainer);
    datesContainer.appendChild(requestForContainer);
  } else {
    datesContainer.appendChild(fromDateContainer);
    datesContainer.appendChild(newDeadlineContainer);
  }

  return {
    datesContainer,
    newDeadlineValue,
    requestInput,
    requestInputError,
    requestForValue,
  };
}
