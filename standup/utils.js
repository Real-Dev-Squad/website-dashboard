async function makeApiCall(url, method, body, credentials, headers, options) {
  try {
    const response = await fetch(url, {
      method,
      body,
      headers,
      credentials,
      ...options,
    });
    return response;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

function createStandupElement({ type, classList }) {
  const element = document.createElement(type);
  element.classList.add(...classList);
  return element;
}

function createLoaderElement() {
  const loaderElement = document.createElement('div');
  loaderElement.classList.add('loader');
  const wrapperElement = document.createElement('div');
  wrapperElement.classList.add('wrapper');
  const circleElement = document.createElement('div');
  circleElement.classList.add('circle');
  const line1Element = document.createElement('div');
  line1Element.classList.add('line-1');
  const line2Element = document.createElement('div');
  line2Element.classList.add('line-2');
  wrapperElement.appendChild(circleElement);
  wrapperElement.appendChild(line1Element);
  wrapperElement.appendChild(line2Element);
  loaderElement.appendChild(wrapperElement);
  return loaderElement;
}

function createSidebarPanelElement(
  completed,
  planned,
  blockers,
  day,
  currentMonthName,
  currentYear,
) {
  const standupHeadElement = createStandupElement({
    type: 'h4',
    classList: ['standup-head'],
  });
  standupHeadElement.innerHTML = `Standup for ${day} ${currentMonthName} ${currentYear}`;
  const sidebarPanelElement = createStandupElement({
    type: 'div',
    classList: ['sidebar-panel', 'sidebar'],
  });
  sidebarPanelElement.id = 'standupSidebar';
  const completedElement = createStandupElement({
    type: 'div',
    classList: ['completed'],
  });
  const plannedElement = createStandupElement({
    type: 'div',
    classList: ['planned'],
  });
  const blockersElement = createStandupElement({
    type: 'div',
    classList: ['blockers'],
  });

  completedElement.innerHTML = `Yesterday<br>${completed}`;
  plannedElement.innerHTML = `Today<br>${planned}`;
  blockersElement.innerHTML = `Blockers<br>${blockers}`;
  sidebarPanelElement.appendChild(standupHeadElement);
  sidebarPanelElement.appendChild(completedElement);
  sidebarPanelElement.appendChild(plannedElement);
  sidebarPanelElement.appendChild(blockersElement);
  return sidebarPanelElement;
}

function formatDateFromTimestamp(timestamp) {
  const dateObject = new Date(timestamp);
  const year = dateObject.getFullYear();
  const month = dateObject.getMonth() + 1;
  const day = dateObject.getDate();
  return `${day}-${month}-${year}`;
}

function formatDate(dateObject) {
  const year = dateObject.getFullYear();
  const month = dateObject.getMonth() + 1;
  const day = dateObject.getDate();
  return `${day}-${month}-${year}`;
}

function getDayOfWeek(date) {
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayIndex = date.getDay();

  return daysOfWeek[dayIndex];
}
