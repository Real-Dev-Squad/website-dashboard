const searchInput = document.getElementById('user-search-input');
const searchButtonElement = document.getElementById('search-button');
const tableContainerElement = document.getElementById('table-container');
const tableElement = document.createElement('table');
tableElement.classList.add('user-standup-table');
const tableBodyElement = document.createElement('tbody');

const currentDateObj = new Date();
const currentYearNum = currentDateObj.getFullYear();
const daysInCurrentMonth = new Date(
  currentYearNum,
  currentDateObj.getMonth() + 1,
  0,
).getDate();
const currentMonthName = currentDateObj.toLocaleString('default', {
  month: 'long',
});

async function fetchUserData(username) {
  const response = await makeApiCall(`${RDS_API_USERS}/${username}`);
  const data = await response.json();
  return data.user;
}

async function fetchStandupData(userId) {
  const response = await makeApiCall(`${RDS_API_STANDUP}${userId}`);
  const data = await response.json();
  return data.data;
}

function processStandupData(standupItems) {
  const standupData = {
    standupFrequency: [],
    completedText: [],
    plannedText: [],
    blockersText: [],
  };
  standupData.standupFrequency = Array(daysInCurrentMonth).fill('❌');
  standupData.completedText = Array(daysInCurrentMonth).fill('No data');
  standupData.plannedText = Array(daysInCurrentMonth).fill('No data');
  standupData.blockersText = Array(daysInCurrentMonth).fill('No data');

  if (!standupItems) {
    return standupData;
  }
  for (let i = 0; i < standupItems.length; i++) {
    const date = new Date(standupItems[i].createdAt);
    const day = date.getDate();
    const index = day - 1;
    if (index < standupData.standupFrequency.length) {
      standupData.standupFrequency[index] = '✅';
      standupData.completedText[index] = standupItems[i].completed;
      standupData.plannedText[index] = standupItems[i].planned;
      standupData.blockersText[index] = standupItems[i].blockers;
    }
  }
  return standupData;
}

function createTableHeaderElement() {
  const tableHeaderElement = createElement({
    type: 'thead',
    classList: ['table-header'],
  });
  const headerRowElement = createElement({
    type: 'tr',
    classList: ['table-header'],
  });
  const headerCellElement = createElement({
    type: 'th',
    classList: ['user', 'date', 'table-head'],
  });
  headerCellElement.innerHTML = 'DATES ➡️<hr />USERS ⬇️';
  headerRowElement.appendChild(headerCellElement);
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dateCellElement = createElement({
      type: 'th',
      classList: ['date'],
      scope: 'row',
    });
    dateCellElement.textContent =
      day + ' ' + currentMonthName + ' ' + currentYearNum;
    headerRowElement.appendChild(dateCellElement);
  }
  tableHeaderElement.appendChild(headerRowElement);
  return tableHeaderElement;
}

function createTableRowElement({ userName, imageUrl, userStandupData }) {
  const rowElement = createElement({ type: 'tr', classList: ['table-row'] });
  const userCellElement = createElement({ type: 'td', classList: ['user'] });
  userCellElement.scope = 'row';
  const userContainerElement = createElement({
    type: 'div',
    classList: ['user-list-item'],
  });
  const userImageElement = createElement({
    type: 'img',
    classList: ['user-image'],
  });
  userImageElement.src = imageUrl || dummyPicture;
  userImageElement.alt = userName;
  const userNameElement = createElement({
    type: 'p',
    classList: ['user-name'],
  });

  userNameElement.textContent = userName;
  userContainerElement.appendChild(userImageElement);
  userContainerElement.appendChild(userNameElement);
  userCellElement.appendChild(userContainerElement);
  rowElement.appendChild(userCellElement);

  const standupStatus = userStandupData.standupFrequency;
  const completedTextData = userStandupData.completedText;
  const plannedText = userStandupData.plannedText;
  const blockersText = userStandupData.blockersText;

  for (let i = 0; i < daysInCurrentMonth; i++) {
    const statusCellElement = createElement({
      type: 'td',
      classList: ['status'],
    });
    statusCellElement.textContent = standupStatus[i];
    const tooltipElement = createElement({
      type: 'div',
      classList: ['tooltiptext'],
      style: {
        visibility: 'visible',
      },
    });
    const completedTextElement = createElement({
      type: 'p',
      classList: ['today-standup'],
    });
    const yesterdayStandupElement = createElement({
      type: 'p',
      classList: ['yesterday-standup'],
    });
    const blockersElement = createElement({
      type: 'p',
      classList: ['blockers'],
    });
    const noStandupTextElement = createElement({
      type: 'p',
      classList: ['no-standup-text'],
    });

    if (standupStatus[i] === '✅') {
      completedTextElement.textContent += `Today's: ${completedTextData[i]}`;
      yesterdayStandupElement.textContent += `Yesterday's: ${plannedText[i]}`;
      blockersElement.textContent += `Blockers: ${blockersText[i]}`;

      tooltipElement.appendChild(completedTextElement);
      tooltipElement.appendChild(yesterdayStandupElement);
      tooltipElement.appendChild(blockersElement);
      statusCellElement.appendChild(tooltipElement);
    }

    rowElement.addEventListener('mouseover', (mouseEvent) => {
      const tooltip = mouseEvent.target.querySelector('.tooltiptext');
      if (tooltip) {
        tooltip.style.visibility = 'visible';
      }
    });
    rowElement.addEventListener('mouseout', (mouseEvent) => {
      const tooltip = mouseEvent.target.querySelector('.tooltiptext');
      if (tooltip) {
        tooltip.style.visibility = 'hidden';
      }
    });
    rowElement.appendChild(statusCellElement);
  }
  return rowElement;
}

function setupTable() {
  const tableHeaderElement = createTableHeaderElement();
  tableElement.appendChild(tableHeaderElement);
  tableElement.appendChild(tableBodyElement);
  tableContainerElement.innerHTML = '';
  tableContainerElement.appendChild(tableElement);
}

async function searchButtonHandler() {
  const usernames = searchInput.value
    .split(',')
    .map((username) => username.trim());
  const filteredUsernames = [...new Set(usernames)];
  tableBodyElement.innerHTML = '';

  for (const username of filteredUsernames) {
    const userData = await fetchUserData(username);
    if (userData) {
      const standupData = await fetchStandupData(userData.id);
      const userStandupData = processStandupData(standupData);
      const imageUrl = userData.picture?.url;
      const tableRowElement = createTableRowElement({
        userName: userData.username,
        imageUrl,
        userStandupData,
      });
      tableBodyElement.appendChild(tableRowElement);
    }
  }
}

function handleEnterKeyPress(event) {
  if (event.key === 'Enter') {
    searchButtonHandler();
  }
}

setupTable();
searchButtonElement.addEventListener('click', searchButtonHandler);
searchInput.addEventListener('keyup', handleEnterKeyPress);
