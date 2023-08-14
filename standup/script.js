const searchInput = document.getElementById('user-search-input');
const searchButtonElement = document.getElementById('search-button');
const tableContainerElement = document.getElementById('table-container');
const tableElement = document.createElement('table');
tableElement.classList.add('user-standup-table');
const tableBodyElement = document.createElement('tbody');
const loaderElement = createLoaderElement();

const currentDateObj = new Date();
const currentYearNum = currentDateObj.getFullYear();
const daysInCurrentMonth = new Date(
  currentYearNum,
  currentDateObj.getMonth() + 1,
  0,
).getDate();
const numberOfMonthsAgo = 3;
function isSunday(date) {
  return date.getDay() === 0; // 0 represents Sunday
}
const currentMonthNum = currentDateObj.getMonth();

const endDate = currentDateObj;
const startDate = new Date(
  currentYearNum,
  currentMonthNum - numberOfMonthsAgo,
  1,
); // Start from 3 months ago

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
const oneDay = 24 * 60 * 60 * 1000;
function processStandupData(standupItems) {
  const standupData = {
    standupFrequency: [],
    completedText: [],
    plannedText: [],
    blockersText: [],
    date: [],
    month: [],
    year: [],
  };

  if (!standupItems) {
    for (
      let date = new Date(endDate);
      date >= startDate;
      date = new Date(date.getTime() - oneDay)
    ) {
      if (!isSunday(date)) {
        standupData.standupFrequency.push('❌');
        standupData.completedText.push('No data');
        standupData.plannedText.push('No data');
        standupData.blockersText.push('No data');
        standupData.date.push(date.getDate());
        standupData.month.push(
          date.toLocaleString('default', { month: 'long' }),
        );
        standupData.year.push(date.getFullYear());
      }
    }
    return standupData;
  }

  const standupDataByDate = {};
  for (let i = 0; i < standupItems.length; i++) {
    const formattedDate = formatDateFromTimestamp(standupItems[i].createdAt);
    standupDataByDate[formattedDate] = standupItems[i];
  }

  for (
    let date = new Date(endDate);
    date >= startDate;
    date = new Date(date.getTime() - oneDay)
  ) {
    if (!isSunday(date)) {
      if (standupDataByDate[formatDate(date)]) {
        const { completed, planned, blockers } =
          standupDataByDate[formatDate(date)];
        standupData.standupFrequency.push('✅');
        standupData.completedText.push(completed);
        standupData.plannedText.push(planned);
        standupData.blockersText.push(blockers);
        standupData.date.push(date.getDate());
        standupData.month.push(
          date.toLocaleString('default', { month: 'long' }),
        );
        standupData.year.push(date.getFullYear());
      } else {
        standupData.standupFrequency.push('❌');
        standupData.completedText.push('No data');
        standupData.plannedText.push('No data');
        standupData.blockersText.push('No data');
        standupData.date.push(date.getDate());
        standupData.month.push(
          date.toLocaleString('default', { month: 'long' }),
        );
        standupData.year.push(date.getFullYear());
      }
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
  for (
    let date = new Date(endDate);
    date >= startDate;
    date = new Date(date.getTime() - oneDay)
  ) {
    if (!isSunday(date)) {
      const dateCellElement = createElement({
        type: 'th',
        classList: ['date'],
        scope: 'row',
      });
      dateCellElement.textContent = `${date.getDate()} ${date.toLocaleString(
        'default',
        { month: 'long' },
      )} ${date.getFullYear()}`;
      headerRowElement.appendChild(dateCellElement);
    }
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
  const date = userStandupData.date;
  const month = userStandupData.month;
  const year = userStandupData.year;
  for (let i = 0; i < standupStatus.length; i++) {
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
      classList: ['today-standup', 'tooltip-text'],
    });
    const yesterdayStandupElement = createElement({
      type: 'p',
      classList: ['yesterday-standup', 'tooltip-text'],
    });
    const blockersElement = createElement({
      type: 'p',
      classList: ['blockers', 'tooltip-text'],
    });
    const noStandupTextElement = createElement({
      type: 'p',
      classList: ['no-standup-text'],
    });
    const sidebarElement = createSidebarPanelElement(
      completedTextData[i],
      plannedText[i],
      blockersText[i],
      date[i],
      month[i],
      year[i],
    );

    if (standupStatus[i] === '✅') {
      completedTextElement.textContent += `Yesterday's: ${completedTextData[i]}`;
      yesterdayStandupElement.textContent += `Today's: ${plannedText[i]}`;
      blockersElement.textContent += `Blockers: ${blockersText[i]}`;

      tooltipElement.appendChild(completedTextElement);
      tooltipElement.appendChild(yesterdayStandupElement);
      tooltipElement.appendChild(blockersElement);
      statusCellElement.appendChild(tooltipElement);

      statusCellElement.addEventListener('click', (event) => {
        event.stopPropagation();

        if (!document.body.contains(sidebarElement)) {
          if (sidebarElement) {
            document.body.appendChild(sidebarElement);
            sidebarElement.classList.add('openSidebar');
            document.body.style.marginRight = '20%';
          }
        } else {
          document.body.removeChild(sidebarElement);
          sidebarElement.classList.remove('openSidebar');
          document.body.style.marginRight = '0%';
        }
      });
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
  const uniqueUsernames = [...new Set(usernames)];
  const formattedUsernames = uniqueUsernames.map(
    (username) => `user:${username}`,
  );
  const queryString = formattedUsernames.join('+');

  const newUrl = `${window.location.origin}${window.location.pathname}?q=${queryString}`;
  window.history.pushState({ path: newUrl }, '', newUrl);

  tableBodyElement.innerHTML = '';

  for (const username of uniqueUsernames) {
    tableContainerElement.appendChild(loaderElement);
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
  tableContainerElement.removeChild(loaderElement);
}

function getUsernames() {
  const queryData = new URL(
    decodeURIComponent(window.location.href),
  ).searchParams.get('q');
  const initialUsernames = queryData
    ?.split(' ')
    .map((username) => username.split(':')[1]);
  return initialUsernames || [];
}

function setUsernames(usernames) {
  searchInput.value = [...new Set(usernames)].join(', ');
}

function handleEnterKeyPress(event) {
  if (event.key === 'Enter') {
    searchButtonHandler();
  }
}
setUsernames(getUsernames());
setupTable();

searchButtonElement.addEventListener('click', searchButtonHandler);
searchInput.addEventListener('keyup', handleEnterKeyPress);

document.addEventListener('click', (event) => {
  const sidebarElement = document.querySelector('.sidebar');
  if (sidebarElement && !sidebarElement.contains(event.target)) {
    document.body.removeChild(sidebarElement);
    sidebarElement.classList.remove('openSidebar');
    document.body.style.marginRight = '0%';
  }
});

if (getUsernames().length > 0) {
  searchButtonHandler();
}
