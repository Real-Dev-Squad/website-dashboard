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
  container.innerHTML = '';

  if (errorMsg) {
    const errorHeading = createElement({
      type: 'h4',
      attributes: { class: 'error-message' },
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

function initializeDateRangePicker() {
  const state = {
    startDate: null,
    endDate: null,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
  };

  const input = document.querySelector('.date-input');
  const calendar = document.querySelector('.calendar');

  function toggleCalendar() {
    calendar.classList.toggle('hidden');
  }

  function handleOutsideClick(e) {
    if (!calendar.contains(e.target) && e.target !== input) {
      calendar.classList.add('hidden');
    }
  }

  function generateCalendarDays() {
    const days = [];
    const date = new Date(state.currentYear, state.currentMonth, 1);

    const firstDay = date.getDay();
    for (let i = firstDay; i > 0; i--) {
      const prevDate = new Date(state.currentYear, state.currentMonth, 1 - i);
      days.push({ date: prevDate, isOtherMonth: true });
    }

    while (date.getMonth() === state.currentMonth) {
      days.push({ date: new Date(date), isOtherMonth: false });
      date.setDate(date.getDate() + 1);
    }

    const lastDay = date.getDay();
    for (let i = 1; i <= 6 - lastDay; i++) {
      days.push({ date: new Date(date), isOtherMonth: true });
      date.setDate(date.getDate() + 1);
    }

    return days;
  }

  function isSelected(date) {
    return (
      (state.startDate && isSameDate(date, state.startDate)) ||
      (state.endDate && isSameDate(date, state.endDate))
    );
  }

  function isInRange(date) {
    if (!state.startDate || !state.endDate) return false;
    return date > state.startDate && date < state.endDate;
  }

  function isSameDate(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  function updateInput() {
    if (state.startDate && state.endDate) {
      input.value = `${state.startDate.toLocaleDateString()} - ${state.endDate.toLocaleDateString()}`;
      const event = new CustomEvent('dateRangeChange', {
        detail: {
          startDate: state.startDate,
          endDate: state.endDate,
        },
      });
      document.dispatchEvent(event);
      activeFilters.startDate = state.startDate.toISOString();
      activeFilters.endDate = state.endDate.toISOString();
      refreshFeed();
    } else if (state.startDate) {
      input.value = state.startDate.toLocaleDateString();
    }
  }

  function renderCalendar() {
    const monthElement = calendar.querySelector('.current-month');
    const grid = calendar.querySelector('.calendar-grid');

    monthElement.textContent = new Date(
      state.currentYear,
      state.currentMonth,
    ).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    grid.innerHTML = '';

    const days = generateCalendarDays();
    days.forEach((day) => {
      const dayElement = document.createElement('div');
      dayElement.className = `calendar-day ${
        day.isOtherMonth ? 'other-month' : ''
      }`;
      dayElement.textContent = day.date.getDate();
      dayElement.dataset.date = day.date.toISOString();

      if (isSelected(day.date)) {
        dayElement.classList.add('selected');
      } else if (isInRange(day.date)) {
        dayElement.classList.add('in-range');
      }

      grid.appendChild(dayElement);
    });
  }

  function handleDayClick(e) {
    if (!e.target.classList.contains('calendar-day')) return;

    const date = new Date(e.target.dataset.date);

    if (!state.startDate || (state.startDate && state.endDate)) {
      state.startDate = date;
      state.endDate = null;
      if (date.getMonth() !== state.currentMonth) {
        state.currentMonth = date.getMonth();
        state.currentYear = date.getFullYear();
      }
    } else if (date > state.startDate) {
      state.endDate = date;
    } else {
      state.endDate = state.startDate;
      state.startDate = date;
    }

    updateInput();
    renderCalendar();

    if (state.startDate && state.endDate) {
      setTimeout(() => calendar.classList.add('hidden'), 200);
    }
  }

  function handleMonthNavigation(e) {
    if (e.target.classList.contains('next-month')) {
      state.currentMonth++;
      if (state.currentMonth > 11) {
        state.currentMonth = 0;
        state.currentYear++;
      }
    } else {
      state.currentMonth--;
      if (state.currentMonth < 0) {
        state.currentMonth = 11;
        state.currentYear--;
      }
    }
    renderCalendar();
  }

  input.addEventListener('click', toggleCalendar);
  document.addEventListener('click', handleOutsideClick);
  calendar
    .querySelector('.calendar-grid')
    .addEventListener('click', handleDayClick);
  calendar.querySelectorAll('.calendar-navigation').forEach((button) => {
    button.addEventListener('click', handleMonthNavigation);
  });

  renderCalendar();
}

document.addEventListener('DOMContentLoaded', initializeDateRangePicker);
