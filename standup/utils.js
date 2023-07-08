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

function createElement({ type, classList }) {
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
  const standupHeadElement = createElement({
    type: 'h4',
    classList: ['standup-head'],
  });
  standupHeadElement.innerHTML = `Standup for ${day} ${currentMonthName} ${currentYear}`;
  const sidebarPanelElement = createElement({
    type: 'div',
    classList: ['sidebar-panel', 'sidebar'],
  });
  sidebarPanelElement.id = 'standupSidebar';
  const completedElement = createElement({
    type: 'div',
    classList: ['completed'],
  });
  const plannedElement = createElement({
    type: 'div',
    classList: ['planned'],
  });
  const blockersElement = createElement({
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
