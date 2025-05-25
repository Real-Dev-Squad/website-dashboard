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
  } = createRequestElements(requestDetails);

  const { summaryContainer, taskDetailsContainer, statusSiteLink } =
    createSummarySection({
      isExtensionRequest,
      isDeadLineCrossed: requestDetails.isDeadlineCrossed,
      deadlineDays: requestDetails.deadlineDays,
      data,
      oldEndsOnValue: requestDetails.oldEndsOnInMillisecond,
      isStatusPending: requestDetails.statusPending,
    });
  const {
    datesContainer,
    newDeadlineValue,
    requestInput,
    requestInputError,
    requestForValue,
  } = createDateContainer(
    isExtensionRequest,
    requestDetails.newDeadlineDays,
    requestDetails.isDeadlineCrossed,
    requestDetails.newEndsOnInMillisecond,
    requestDetails.requestDays,
    requestDetails.oldEndsOnInMillisecond,
  );
  const {
    container: reasonContainer,
    textAreaInput: reasonInput,
    inputError: reasonInputError,
    paragraph: reasonParagraph,
  } = createTextBlockContainer(data, true);

  const { container: commentContainer } = createTextBlockContainer(data, false);

  const requestActionContainer = createActionContainer({
    context: {
      isExtensionRequest,
      data,
      currentUser,
      isStatusPending: requestDetails.statusPending,
    },
    elements: {
      titleInput,
      titleInputError,
      reasonInput,
      reasonInputError,
      requestInput,
      requestInputError,
      titleInputWrapper,
    },
    uiHandlers: { toggleInputs, appendLogs },
    domRefs: {
      panel,
      accordionButton,
      rootElement,
      parentContainer,
      requestDetails,
    },
  });

  titleInputWrapper.append(titleInput, titleInputError);
  committedHoursHoverCard.append(committedHoursLabel, committedHoursContent);
  requestCardHeaderWrapper.append(
    titleInputWrapper,
    titleText,
    committedHoursHoverTrigger,
    committedHoursHoverCard,
  );

  if (isExtensionRequest) {
    formContainer.append(requestCardHeaderWrapper);
  }
  taskDetailsContainer.append(requestedContainer);
  requestedTextValue.append(requestCreatedAtTooltip);
  requestedContainer.append(requestedTextLabel, requestedTextValue);

  const taskStatusContainer = createElement({ type: 'div' });
  if (isExtensionRequest) {
    taskDetailsContainer.append(taskStatusContainer);
  }

  taskStatusContainer.append(taskStatusTextLabel, taskStatusElement);
  summaryContainer.append(datesContainer);
  newDeadlineValue.append(newEndsOnTooltip);
  requestForValue.append(newEndsOnTooltip.cloneNode(true));

  const requestNumberContainer = createElement({ type: 'div' });
  if (isExtensionRequest) {
    datesContainer.append(requestNumberContainer);
  } else if (data.type !== REQUEST_TYPE.OOO) {
    taskDetailsContainer.append(requestNumberContainer);
  }

  requestNumberContainer.append(requestNumberLabel, requestNumberValue);
  cardAssigneeButtonContainer.append(assigneeContainer);

  assigneeContainer.append(
    assigneeTextLabel,
    assigneeImage,
    assigneeNameElement,
  );

  cardAssigneeButtonContainer.append(requestActionContainer);

  panel.append(reasonContainer);

  if (isExtensionRequest) {
    panel.append(logContainer);
  } else if (data?.state !== REQUEST_STATUS.PENDING) {
    panel.append(commentContainer);
  }

  accordionButton.addEventListener('click', function () {
    isExtensionRequest ? renderLogs(data.id) : toggleAccordionPanel(panel);
  });
  const cardFooter = createElement({ type: 'div' });
  cardFooter.append(cardAssigneeButtonContainer, accordionContainer);
  formContainer.append(summaryContainer, cardFooter);
  rootElement.append(formContainer);

  formContainer.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = getFormEntries(new FormData(e.target));
    formData.newEndsOn = new Date(formData.newEndsOn).getTime() / 1000;

    const todayDate = Math.floor(new Date().getTime() / 1000);
    if (
      !formData.title?.trim() ||
      !formData.reason?.trim() ||
      isNaN(formData.newEndsOn) ||
      formData.newEndsOn < todayDate
    ) {
      return;
    }

    const removeSpinner = addLoadingSpinner(rootElement);
    rootElement.classList.add('disabled');
    const revertDataChange = updateCardData(formData);
    const payloadForLog = {
      body: {
        ...(formData?.newEndsOn !== requestDetails.newEndsOnInMillisecond && {
          newEndsOn: formData.newEndsOn,
          oldEndsOn: requestDetails.oldEndsOnInMillisecond,
        }),
        ...(formData?.reason !== data.reason && {
          newReason: formData.reason,
          oldReason: data.reason,
        }),
        ...(formData?.title !== data.title && {
          newTitle: formData.title,
          oldTitle: data.title,
        }),
      },
      meta: {
        requestId: data.id,
        name: [currentUser?.first_name, currentUser?.last_name]
          .filter(Boolean)
          .join(' '),
        userId: currentUser?.id,
      },
      timestamp: {
        _seconds: Date.now() / 1000,
      },
    };
    updateExtensionRequest({
      id: data.id,
      body: formData,
      underDevFeatureFlag: true,
    })
      .then(() => {
        data.reason = formData.reason;
        data.title = formData.title;
        data.newEndsOn = formData.newEndsOn;
        showSuccessHighlight(rootElement);
        showToastMessage({
          isDev: true,
          oldToastFunction: showToast,
          type: 'success',
          message: SUCCESS_MESSAGE.UPDATED,
        });

        appendLogs(payloadForLog, data.id);
      })
      .catch((error) => {
        revertDataChange();
        showErrorHighlight(rootElement);

        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          ERROR_MESSAGE.UPDATE;
        showToastMessage({
          isDev: true,
          oldToastFunction: showToast,
          type: 'error',
          message: errorMessage,
        });
      })
      .finally(() => {
        rootElement.classList.remove('disabled');
        toggleAccordionPanel(panel);
        removeSpinner();
      });
  });

  function updateCardData(formData) {
    const previousTitle = titleText.innerText;
    const previousReason = reasonParagraph.innerText;
    const previousRequestValue = requestForValue.innerText;
    const previousNewDeadlineValue = newDeadlineValue.innerText;
    const currentTimestamp = Date.now();
    titleText.innerText = formData.title;
    reasonParagraph.innerText = formData.reason;
    const formDataNewEndsOn = getTimeInMilliseconds(
      formData.newEndsOn,
      isExtensionRequest,
    );
    const extDays = dateDiff(
      formDataNewEndsOn,
      requestDetails.oldEndsOnInMillisecond,
    );
    requestForValue.innerText = ` +${extDays}`;
    const isNewDeadLineCrossed = currentTimestamp > formDataNewEndsOn;
    const newDeadlineDays = dateDiff(
      currentTimestamp,
      formDataNewEndsOn,
      (d) => d + (isNewDeadLineCrossed ? ' ago' : ''),
    );
    newDeadlineValue.innerText = newDeadlineDays;
    newEndsOnTooltip.innerText = formatToFullDate(formDataNewEndsOn);
    newDeadlineValue.append(newEndsOnTooltip);
    function revertDataChange() {
      titleText.innerText = previousTitle;
      reasonParagraph.innerText = previousReason;
      requestForValue.innerText = previousRequestValue;
      newDeadlineValue.innerText = previousNewDeadlineValue;
      newEndsOnTooltip.innerText = formatToFullDate(
        requestDetails.newEndsOnInMillisecond,
      );
      requestCreatedAtTooltip.innerText = formatToFullDate(
        requestDetails.requestCreatedAt,
      );
    }
    return revertDataChange;
  }

  function toggleInputs() {
    titleInputWrapper.classList.toggle('hidden');
    titleInput.classList.toggle('hidden');
    titleText.classList.toggle('hidden');
    reasonInput.classList.toggle('hidden');
    reasonParagraph.classList.toggle('hidden');
    newDeadlineValue.classList.toggle('hidden');
    requestInput.classList.toggle('hidden');
  }

  async function renderLogs(extensionRequestId) {
    const logContainer = document.getElementById(
      `log-container-${extensionRequestId}`,
    );
    if (logContainer.querySelector('.server-log')?.innerHTML) {
      return;
    }
    try {
      const extensionLogs = await getExtensionRequestLogs({
        extensionRequestId,
      });
      const innerHTML = generateSentence(
        extensionLogs.logs,
        'server-log',
        extensionRequestId,
      );
      if (innerHTML) {
        const isLocalLogPresent = logContainer.querySelectorAll('.local-log');
        if (isLocalLogPresent) {
          const tempDiv = document.createElement('div');
          tempDiv.classList.add('invisible-div');
          tempDiv.innerHTML = innerHTML;

          const localLogElement = logContainer.querySelector('.local-log');
          logContainer.insertBefore(tempDiv, localLogElement);
        } else {
          logContainer.innerHTML += innerHTML;
        }
        updateAccordionHeight(panel);
      }
    } catch (error) {
      console.error('Failed to fetch extension request logs:', error);
    }
  }

  const userImage = requestUser?.picture?.url ?? ICONS.DEFAULT_USER_AVATAR;
  let userFirstName = requestUser?.first_name ?? data.assignee;
  const userId = requestUser?.id;
  const userStatus = userStatusMap?.get(userId);
  const committedHours = userStatus?.monthlyHours?.committed;
  userFirstName = userFirstName ?? '';

  assigneeImage.src = userImage;
  assigneeImage.classList.remove('skeleton');
  assigneeImage.alt = userFirstName;
  assigneeNameElement.innerText = userFirstName;
  assigneeNameElement.classList.remove('skeleton-text');

  committedHoursLabel.innerText = 'Committed Hours:';
  if (committedHours !== undefined && committedHours !== null) {
    committedHoursContent.innerText = `${committedHours / 4} hrs / week`;
  } else {
    committedHoursContent.innerText = 'Missing';
    committedHoursContent.classList.add('label-content-missing');
  }

  fetchTaskDetailsPromise.then(({ taskData }) => {
    if (taskData) {
      const taskStatus = taskData?.status?.replaceAll('_', ' ');
      statusSiteLink.href = `${STATUS_BASE_URL}/tasks/${data.taskId}`;
      statusSiteLink.innerText = taskData.title;
      statusSiteLink.classList.remove('skeleton-link');
      taskStatusElement.innerText = ` ${taskStatus}`;
      taskStatusElement.classList.remove('skeleton-span');
    } else {
      statusSiteLink.href = '#';
      statusSiteLink.innerText = 'Task not found';
      statusSiteLink.classList.remove('skeleton-link');
      taskStatusElement.innerText = ' Unknown status';
      taskStatusElement.classList.remove('skeleton-span');
    }
  });

  fragment.append(rootElement);
  parentContainer.append(fragment);

  return rootElement;

  function appendLogs(payload, requestId) {
    const logContainer = document.getElementById(`log-container-${requestId}`);

    if (
      payload?.body?.status &&
      !logContainer.querySelector('.server-log')?.innerHTML
    ) {
      return;
    }
    const innerHTML = generateSentence([payload], 'local-log', requestId);
    if (innerHTML) {
      logContainer.innerHTML += innerHTML;
    }
  }
}

function prepareRequestCardData({ data, isExtensionRequest }) {
  const currentTimestamp = Date.now();

  let oldEndsOn = data?.oldEndsOn;
  let newEndsOn = data?.newEndsOn;

  if (data.type === REQUEST_TYPE.OOO) {
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
    ? data.status === REQUEST_STATUS.PENDING
    : data.state === REQUEST_STATUS.PENDING;
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
    : getTwoDigitDate(newEndsOnInMillisecond, true);

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
    attributes: {
      class: 'accordion uninitialized',
      'data-testid': 'accordion-button',
    },
  });

  const panel = createElement({
    type: 'div',
    attributes: { class: 'panel' },
  });

  const downArrowIcon = createElement({
    type: 'img',
    attributes: {
      src: ICONS.ARROW_DOWN,
      alt: 'down-arrow',
    },
  });
  accordionButton.append(downArrowIcon);
  accordionContainer.append(accordionButton, panel);

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
    attributes: {
      class: 'card-row-text ',
      'data-testid': 'request-number-container',
    },
    innerText: 'Request ',
  });

  const requestNumberValue = createElement({
    type: 'span',
    innerText: `#${requestDetails.requestNumber}`,
  });

  return {
    requestedContainer,
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

function createRequestCardHeader(data) {
  const requestCardHeaderWrapper = createElement({
    type: 'div',
    attributes: { class: 'request-header-wrapper' },
  });

  const titleText = createElement({
    type: 'span',
    attributes: {
      class: 'card-title title-text',
      'data-testid': 'request-title-text',
    },

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
