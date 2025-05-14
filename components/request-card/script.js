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

  let oldEndsOn = data.oldEndsOn;
  let newEndsOn = data.newEndsOn;
  const currentTimestamp = Date.now();

  if (data.type === RequestType.OOO) {
    oldEndsOn = data.from;
    newEndsOn = data.until;
  }

  const requestNumber = data.requestNumber;
  let assigneeNameElement;
  let assigneeImage;
  let taskStatusElement;

  const taskDataPromise = isExtensionRequest
    ? getTaskDetails(data.taskId)
    : Promise.resolve({ taskData: null });

  const oldEndsOnInMillisecond = getTimeInMilliseconds(
    oldEndsOn,
    isExtensionRequest,
  );
  const newEndsOnInMillisecond = getTimeInMilliseconds(
    newEndsOn,
    isExtensionRequest,
  );
  const requestCreatedAt = getTimeInMilliseconds(
    isExtensionRequest ? data.timestamp : data.createdAt,
    isExtensionRequest,
  );

  const isDeadLineCrossed = currentTimestamp > oldEndsOnInMillisecond;
  const isNewDeadLineCrossed = currentTimestamp > newEndsOnInMillisecond;
  const isStatusPending = isExtensionRequest
    ? data.status === RequestStatus.PENDING
    : data.state === RequestStatus.PENDING;
  const requestedDaysTextColor = getRequestColor(
    oldEndsOnInMillisecond,
    requestCreatedAt,
  );

  const requestTimestamp = requestCreatedAt;

  const requestDays = dateDiff(newEndsOnInMillisecond, oldEndsOnInMillisecond);

  const deadlineDays = dateDiff(
    currentTimestamp,
    oldEndsOnInMillisecond,
    (d) => d + (isDeadLineCrossed ? ' ago' : ''),
  );

  const newDeadlineDays = isExtensionRequest
    ? dateDiff(
        currentTimestamp,
        newEndsOnInMillisecond,
        (d) => d + (isNewDeadLineCrossed ? ' ago' : ''),
      )
    : getTwoDigitDate(newEndsOn);

  const requestedDaysAgo = dateDiff(
    currentTimestamp,
    requestTimestamp,
    (s) => s + ' ago',
  );

  const formContainer = createElement({
    type: 'form',
    attributes: { class: 'request-card-form' },
  });
  const titleText = createElement({
    type: 'span',
    attributes: { class: 'card-title title-text' },
    'data-testid': 'request-title-text',
    innerText: data.title,
  });
  const committedHoursHoverTrigger = createElement({
    type: 'img',
    attributes: {
      class: 'committed-hours-trigger',
      src: '/images/time.svg',
      alt: 'clock-icon',
      'data-testid': 'committed-hours-trigger',
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
    }, HOVER_CARD_HIDE_DELAY);
  });

  committedHoursHoverTrigger.addEventListener('mouseenter', () => {
    committedHoursHoverCard.classList.remove('hidden');
  });
  committedHoursHoverTrigger.addEventListener('mouseleave', () => {
    setTimeout(() => {
      committedHoursHoverCard.classList.add('hidden');
    }, HOVER_CARD_HIDE_DELAY);
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
    innerText: `${requestedDaysAgo}`,
  });

  const requestedToolTip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: `${formatToFullDate(requestCreatedAt)}`,
  });
  const taskStatusText = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Task status ',
  });
  taskStatusElement = createElement({
    type: 'span',
    attributes: {
      class: 'skeleton-span',
      'data-testid': 'skeleton-span',
    },
  });

  const newDeadlineToolTip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: `${formatToFullDate(newEndsOnInMillisecond)}`,
  });

  const requestToolTip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: formatToFullDate(newEndsOnInMillisecond),
  });

  const requestRequestNumber = createElement({
    type: 'span',
    attributes: { class: 'card-row-text ' },
    innerText: 'Request ',
    'data-testid': 'request-number-container',
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
    'data-testid': 'accordion-button',
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
      oldEndsOn,
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
    newEndsOn,
    requestDays,
    oldEndsOn,
  );
  const {
    container: reasonContainer,
    textAreaInput: reasonInput,
    inputError: reasonInputError,
    paragraph: reasonParagraph,
  } = createTextBlockContainer(data, true);

  const { container: commentContainer } = createTextBlockContainer(data, false);
}
