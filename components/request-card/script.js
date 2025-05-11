async function createRequestCardComponent({
  data,
  isExtensionRequest,
  parentContainer,
  currentUser,
  requestUser,
  userStatusMap = null,
}) {
  if (isExtensionRequest) {
    renderLogRecord[data.id] = [];
  }

  const fragment = document.createDocumentFragment();
  const rootElement = createElement({
    type: 'div',
    attributes: {
      class: `request-card ${isExtensionRequest ? '' : 'request-card-padding'}`,
      'data-testid': isExtensionRequest
        ? 'extension-request-card'
        : `${data?.type?.toLowerCase() ?? 'unknown'}-request-card`,
    },
  });

  let oldEndsOnValue = data.oldEndsOn;
  let newEndsOnValue = data.newEndsOn;
  const currentTimestamp = Date.now();

  if (!isExtensionRequest && data.type === 'OOO') {
    oldEndsOnValue = data.from;
    newEndsOnValue = data.until;
  }

  const requestNumber = data.requestNumber || 1;
  let assigneeNameElement;
  let assigneeImage;
  let taskStatusValue;

  const taskDataPromise = isExtensionRequest
    ? getTaskDetails(data.taskId)
    : Promise.resolve({ taskData: null });

  const isDeadLineCrossed =
    currentTimestamp >
    normalizeToMilliseconds(oldEndsOnValue, isExtensionRequest);
  const isNewDeadLineCrossed =
    currentTimestamp >
    normalizeToMilliseconds(newEndsOnValue, isExtensionRequest);
  const isStatusPending = isExtensionRequest
    ? data.status === RequestStatus.PENDING
    : data.state === RequestStatus.PENDING;
  const requestedDaysTextColor = getRequestColor(
    normalizeToMilliseconds(oldEndsOnValue, isExtensionRequest),
    normalizeToMilliseconds(
      isExtensionRequest ? data.timestamp : data.createdAt,
      isExtensionRequest,
    ),
  );
  const requestDays = dateDiff(
    normalizeToMilliseconds(newEndsOnValue, isExtensionRequest),
    normalizeToMilliseconds(oldEndsOnValue, isExtensionRequest),
  );
  const deadlineDays = dateDiff(
    currentTimestamp,
    normalizeToMilliseconds(oldEndsOnValue, isExtensionRequest),
    (d) => d + (isDeadLineCrossed ? ' ago' : ''),
  );
  const newDeadlineDays = isExtensionRequest
    ? dateDiff(
        currentTimestamp,
        normalizeToMilliseconds(newEndsOnValue, isExtensionRequest),
        (d) => d + (isNewDeadLineCrossed ? ' ago' : ''),
      )
    : getTwoDigitDate(newEndsOnValue);
  const requestedDaysAgo = dateDiff(
    currentTimestamp,
    normalizeToMilliseconds(
      isExtensionRequest ? data.timestamp : data.createdAt,
      isExtensionRequest,
    ),
    (s) => s + ' ago',
  );

  const formContainer = createElement({
    type: 'form',
    attributes: { class: 'request-card-form' },
  });
  const titleText = createElement({
    type: 'span',
    attributes: { class: 'card-title title-text' },
    innerText: data.title,
  });
  const committedHoursHoverTrigger = createElement({
    type: 'img',
    attributes: {
      class: 'committed-hours-trigger',
      src: '/images/time.svg',
      alt: 'clock-icon',
    },
  });
  const requestCardHeaderWrapper = createElement({
    type: 'div',
    attributes: { class: 'request-header-wrapper' },
  });
  const titleInput = createElement({
    type: 'input',
    attributes: {
      class: 'title-text title-text-input hidden',
      id: 'title',
      name: 'title',
      value: data.title,
      'data-testid': 'title-text-input',
    },
  });
  const titleInputWrapper = createElement({
    type: 'div',
    attributes: { class: 'title-input-wrapper hidden' },
  });
  const titleInputError = createElement({
    type: 'div',
    attributes: {
      class: 'title-input-error hidden',
      'data-testid': 'title-input-error',
    },
    innerText: 'Title is required',
  });

  const committedHoursHoverCard = createElement({
    type: 'div',
    attributes: { class: 'committed-hours hidden' },
  });
  const CommittedHoursLabel = createElement({
    type: 'span',
    attributes: { class: 'label' },
  });
  const CommittedHoursContent = createElement({
    type: 'span',
    attributes: { class: 'label-content' },
  });

  let hideTimeout;

  committedHoursHoverTrigger.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
    committedHoursHoverCard.classList.remove('hidden');
  });

  committedHoursHoverTrigger.addEventListener('mouseleave', () => {
    hideTimeout = setTimeout(() => {
      committedHoursHoverCard.classList.add('hidden');
    }, 700);
  });

  committedHoursHoverTrigger.addEventListener('mouseenter', () => {
    committedHoursHoverCard.classList.remove('hidden');
  });
  committedHoursHoverTrigger.addEventListener('mouseleave', () => {
    setTimeout(() => {
      committedHoursHoverCard.classList.add('hidden');
    }, 700);
  });

  const detailsContainer = createElement({
    type: 'div',
    attributes: { class: 'details-container' },
  });

  const detailsLine = createElement({
    type: 'span',
    attributes: { class: 'details-line' },
  });
  const requestedContainer = createElement({
    type: 'div',
    attributes: { id: 'requested-time-container' },
  });

  const requestedText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Requested ',
  });
  const requestedValue = createElement({
    type: 'span',
    attributes: {
      class: `requested-day tooltip-container ${requestedDaysTextColor}`,
    },
    innerText: ` ${requestedDaysAgo}`,
  });

  const requestedToolTip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: `${formatToFullDate(
      normalizeToMilliseconds(
        isExtensionRequest ? data.timestamp : data.createdAt,
        isExtensionRequest,
      ),
    )}`,
  });
  const taskStatusText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Task status ',
  });
  taskStatusValue = createElement({
    type: 'span',
    attributes: {
      class: 'skeleton-span',
      'data-testid': 'skeleton-span',
    },
  });

  const newDeadlineToolTip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: `${formatToFullDate(
      normalizeToMilliseconds(newEndsOnValue, isExtensionRequest),
    )}`,
  });

  const requestToolTip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: formatToFullDate(
      normalizeToMilliseconds(newEndsOnValue, isExtensionRequest),
    ),
  });

  const requestRequestNumber = createElement({
    type: 'span',
    attributes: { class: 'card-row-text ' },
    innerText: 'Request ',
  });

  const requestRequestNumberValue = createElement({
    type: 'span',
    innerText: `#${requestNumber}`,
  });

  const cardAssigneeButtonContainer = createElement({
    type: 'div',
    attributes: { class: 'card-assignee-button-container' },
  });
  const assigneeContainer = createElement({
    type: 'div',
    attributes: { class: 'assignee-container' },
  });

  const assigneeText = createElement({
    type: 'span',
    attributes: { class: 'assignee-text' },
    innerText: 'Requested By',
  });

  assigneeImage = createElement({
    type: 'img',
    attributes: {
      class: 'assignee-image skeleton',
      'data-testid': 'assignee-image skeleton',
    },
  });

  assigneeNameElement = createElement({
    type: 'span',
    attributes: {
      class: 'assignee-name skeleton-text',
      'data-testid': 'assignee-name skeleton-text',
    },
  });

  const panel = createElement({
    type: 'div',
    attributes: { class: 'panel' },
  });

  const accordionButton = createElement({
    type: 'button',
    attributes: { class: 'accordion uninitialized' },
  });
  const downArrowIcon = createElement({
    type: 'img',
    attributes: {
      src: ICON_ARROW_DOWN,
      alt: 'down-arrow',
    },
  });

  const logContainer = createElement({
    type: 'div',
    attributes: { id: `log-container-${data.id}` },
  });

  const logDetailsLine = createElement({
    type: 'span',
    attributes: { class: 'log-details-line' },
    innerText: 'Logs',
  });

  const logDetailsLines = createElement({
    type: 'span',
    attributes: { class: 'details-line' },
  });

  const { summaryContainer, taskDetailsContainer, statusSiteLink } =
    createSummarySection({
      isExtensionRequest,
      isDeadLineCrossed,
      deadlineDays,
      data,
      oldEndsOnValue,
      isStatusPending,
    });
  const {
    datesContainer,
    newDeadlineValue,
    requestInput,
    requestInputError,
    requestForValue,
  } = createDateContainer(
    isExtensionRequest,
    newDeadlineDays,
    isDeadLineCrossed,
    newEndsOnValue,
    requestDays,
    oldEndsOnValue,
  );
  const {
    container: reasonContainer,
    textAreaInput: reasonInput,
    inputError: reasonInputError,
    paragraph: reasonParagraph,
  } = createTextBlockContainer(data, true);

  const { container: commentContainer } = createTextBlockContainer(data, false);
}
