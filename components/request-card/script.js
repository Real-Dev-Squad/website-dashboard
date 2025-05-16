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

  const fetchTaskDetailsPromise = isExtensionRequest
    ? getTaskDetails(data.taskId).catch((err) => {
        console.error('Failed to fetch task details:', err);
        return { taskData: null };
      })
    : Promise.resolve({ taskData: null });

  const requestDetails = prepareRequestCardData({ data, isExtensionRequest });

  const formContainer = createElement({
    type: 'form',
    attributes: { class: 'request-card-form' },
  });

  const {
    trigger: committedHoursHoverTrigger,
    hoverCard: committedHoursHoverCard,
    label: committedHoursLabel,
    content: committedHoursContent,
    removeListeners: removeHoverCardListeners,
  } = createCommittedHoursHover();

  const {
    requestCardHeaderWrapper,
    titleText,
    titleInput,
    titleInputError,
    titleInputWrapper,
  } = createRequestCardHeader(data);

  const {
    cardAssigneeButtonContainer,
    assigneeContainer,
    assigneeTextLabel,
    assigneeImage,
    assigneeNameElement,
  } = createAssigneeElements();

  const logContainer = createLogContainer(data);

  const { accordionButton, accordionContainer, panel } =
    createAccordionContainer();

  const {
    requestedContainer,
    requestedTextLabel,
    taskStatusElement,
    requestedTextValue,
    requestCreatedAtTooltip,
    newEndsOnTooltip,
    requestNumberLabel,
    requestNumberValue,
    taskStatusTextLabel,
  } = createRequestElements();

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

function prepareRequestCardData({ data, isExtensionRequest }) {
  const currentTimestamp = Date.now();
  let oldEndsOn = data.oldEndsOn;
  let newEndsOn = data.newEndsOn;

  if (data.type === RequestType.OOO) {
    oldEndsOn = data.from;
    newEndsOn = data.until;
  }

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

  const isDeadlineCrossed = currentTimestamp > oldEndsOnInMillisecond;
  const isNewDeadlineCrossed = currentTimestamp > newEndsOnInMillisecond;

  const statusPending = isExtensionRequest
    ? data.status === RequestStatus.PENDING
    : data.state === RequestStatus.PENDING;

  const deadlineDays = dateDiff(
    currentTimestamp,
    oldEndsOnInMillisecond,
    (d) => d + (isDeadlineCrossed ? ' ago' : ''),
  );

  const newDeadlineDays = isExtensionRequest
    ? dateDiff(
        currentTimestamp,
        newEndsOnInMillisecond,
        (d) => d + (isNewDeadlineCrossed ? ' ago' : ''),
      )
    : getTwoDigitDate(newEndsOn);

  return {
    oldEndsOnInMillisecond,
    newEndsOnInMillisecond,
    requestCreatedAt,
    isDeadlineCrossed,
    isNewDeadlineCrossed,
    statusPending,
    requestDays: dateDiff(newEndsOnInMillisecond, oldEndsOnInMillisecond),
    requestedDaysAgo: dateDiff(
      currentTimestamp,
      requestCreatedAt,
      (s) => s + ' ago',
    ),
    requestedDaysTextColor: getRequestColor(
      oldEndsOnInMillisecond,
      requestCreatedAt,
    ),
    deadlineDays,
    newDeadlineDays,
    requestNumber: data.requestNumber,
  };
}

function createCommittedHoursHover() {
  const trigger = createElement({
    type: 'img',
    attributes: {
      class: 'committed-hours-trigger',
      src: '/images/time.svg',
      alt: 'clock-icon',
      'data-testid': 'committed-hours-trigger',
    },
  });

  const hoverCard = createElement({
    type: 'div',
    attributes: { class: 'committed-hours hidden' },
  });

  const label = createElement({
    type: 'span',
    attributes: { class: 'label' },
  });

  const content = createElement({
    type: 'span',
    attributes: { class: 'label-content' },
  });

  hoverCard.append(label, content);

  const removeListeners = setupHoverCardListeners(trigger, hoverCard);

  return {
    trigger,
    hoverCard,
    label,
    content,
    removeListeners,
  };
}

function setupHoverCardListeners(triggerElement, hoverCardElement) {
  let hideDelayTimeout;

  const showHoverCard = () => {
    clearTimeout(hideDelayTimeout);
    hoverCardElement.classList.remove('hidden');
  };

  const hideHoverCard = () => {
    hideDelayTimeout = setTimeout(() => {
      hoverCardElement.classList.add('hidden');
    }, HOVER_CARD_HIDE_DELAY);
  };

  triggerElement.addEventListener('mouseenter', showHoverCard);
  triggerElement.addEventListener('mouseleave', hideHoverCard);

  return () => {
    triggerElement.removeEventListener('mouseenter', showHoverCard);
    triggerElement.removeEventListener('mouseleave', hideHoverCard);
  };
}

function createAssigneeElements() {
  const cardAssigneeButtonContainer = createElement({
    type: 'div',
    attributes: { class: 'card-assignee-button-container' },
  });

  const assigneeContainer = createElement({
    type: 'div',
    attributes: { class: 'assignee-container' },
  });

  const assigneeTextLabel = createElement({
    type: 'span',
    attributes: { class: 'assignee-text' },
    innerText: 'Requested By',
  });

  const assigneeImage = createElement({
    type: 'img',
    attributes: {
      class: 'assignee-image skeleton',
      'data-testid': 'assignee-image skeleton',
    },
  });

  const assigneeNameElement = createElement({
    type: 'span',
    attributes: {
      class: 'assignee-name skeleton-text',
      'data-testid': 'assignee-name skeleton-text',
    },
  });

  return {
    cardAssigneeButtonContainer,
    assigneeContainer,
    assigneeTextLabel,
    assigneeImage,
    assigneeNameElement,
  };
}

function createLogContainer(data) {
  const logContainer = createElement({
    type: 'div',
    attributes: { id: `log-container-${data.id}` },
  });

  const logLabel = createElement({
    type: 'span',
    attributes: { class: 'log-details-line' },
    innerText: 'Logs',
  });

  const logContent = createElement({
    type: 'span',
    attributes: { class: 'details-line' },
  });

  logContainer.append(logLabel, logContent);

  return logContainer;
}

function createAccordionContainer() {
  const accordionContainer = createElement({ type: 'div' });
  const accordionButton = createElement({
    type: 'button',
    attributes: { class: 'accordion uninitialized' },
    'data-testid': 'accordion-button',
  });

  const panel = createElement({
    type: 'div',
    attributes: { class: 'panel' },
  });

  const downArrowIcon = createElement({
    type: 'img',
    attributes: {
      src: ICON_ARROW_DOWN,
      alt: 'down-arrow',
    },
  });

  accordionContainer.appendChild(accordionButton);
  accordionButton.appendChild(downArrowIcon);
  accordionContainer.appendChild(panel);

  return {
    accordionContainer,
    accordionButton,
    panel,
  };
}

function createRequestElements(requestDetails) {
  const requestedContainer = createElement({
    type: 'div',
    attributes: { id: 'requested-time-container' },
  });

  const requestedTextLabel = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Requested ',
  });
  const requestedTextValue = createElement({
    type: 'span',
    attributes: {
      class: `requested-day tooltip-container ${requestDetails.requestedDaysTextColor}`,
    },
    innerText: `${requestDetails.requestedDaysAgo}`,
  });

  const requestCreatedAtTooltip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: `${formatToFullDate(requestDetails.requestCreatedAt)}`,
  });

  const taskStatusTextLabel = createElement({
    type: 'span',
    attributes: { class: 'card-row-text' },
    innerText: 'Task status ',
  });

  const taskStatusElement = createElement({
    type: 'span',
    attributes: {
      class: 'skeleton-span',
      'data-testid': 'skeleton-span',
    },
  });

  const newEndsOnTooltip = createElement({
    type: 'span',
    attributes: { class: 'tooltip' },
    innerText: `${formatToFullDate(requestDetails.newEndsOnInMillisecond)}`,
  });

  const requestNumberLabel = createElement({
    type: 'span',
    attributes: { class: 'card-row-text ' },
    innerText: 'Request ',
    'data-testid': 'request-number-container',
  });

  const requestNumberValue = createElement({
    type: 'span',
    innerText: `#${requestDetails.requestNumber}`,
  });

  return {
    requestedContainer,
    requestedTextLabel,
    requestedTextLabel,
    taskStatusElement,
    requestedTextValue,
    requestCreatedAtTooltip,
    newEndsOnTooltip,
    requestNumberLabel,
    requestNumberValue,
    taskStatusTextLabel,
  };
}

function createRequestCardHeader() {
  const requestCardHeaderWrapper = createElement({
    type: 'div',
    attributes: { class: 'request-header-wrapper' },
  });

  const titleText = createElement({
    type: 'span',
    attributes: { class: 'card-title title-text' },
    'data-testid': 'request-title-text',
    innerText: data.title,
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

  return {
    requestCardHeaderWrapper,
    titleText,
    titleInput,
    titleInputError,
    titleInputWrapper,
  };
}
