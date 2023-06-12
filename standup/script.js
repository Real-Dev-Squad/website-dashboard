const userInput = document.getElementById('user-search-input');
const searchButton = document.getElementById('search-button');
const tableContainer = document.getElementById('table-container');
const table = document.createElement('table');
table.classList.add('user-standup-table');
const tableBody = document.createElement('tbody');

async function getUserData(username) {
  const response = await makeApiCall(`${RDS_API_USERS}/${username}`);
  const data = await response.json();
  return data.user;
}

async function getStandupData(userId) {
  const response = await makeApiCall(`${RDS_API_STANDUP}${userId}`);
  const data = await response.json();
  return data.data;
}

function getStatusArray(apiResponse) {
  if (!Array.isArray(apiResponse) || apiResponse.length === 0) {
    const currentDate = new Date();
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).getDate();
    return Array(daysInMonth).fill('❌');
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const statusArray = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const filteredData = apiResponse.filter((item) => {
      const itemDate = new Date(item.createdAt);
      const itemMonth = itemDate.getMonth();
      const itemYear = itemDate.getFullYear();
      return (
        itemDate.getDate() === day &&
        itemMonth === currentMonth &&
        itemYear === currentYear
      );
    });

    if (filteredData.length > 0 && day === 1) {
      statusArray.push('✅');
    } else {
      statusArray.push(filteredData.length > 0 ? '✅' : '❌');
    }
  }

  return statusArray;
}

function renderTableHeader() {
  const tableHeader = createElement({
    type: 'thead',
    classList: ['table-header'],
  });

  const headerRow = createElement({ type: 'tr', classList: ['table-header'] });

  const headerCell = createElement({
    type: 'th',
    classList: ['user', 'date', 'table-head'],
  });
  headerCell.innerHTML = 'DATES ➡️<hr />USERS ⬇️';
  headerRow.appendChild(headerCell);

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(
    currentYear,
    currentDate.getMonth() + 1,
    0,
  ).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateCell = createElement({ type: 'th', classList: ['date'] });
    dateCell.scope = 'col';
    dateCell.textContent = day + ' ' + currentMonth + ' ' + currentYear;
    headerRow.appendChild(dateCell);
  }

  tableHeader.appendChild(headerRow);
  return tableHeader;
}

function renderTableRow({ userName, imageUrl, standupStatus, standupText }) {
  console.log(standupText);
  const row = createElement({ type: 'tr', classList: ['table-row'] });

  const userCell = createElement({ type: 'td', classList: ['user'] });
  userCell.scope = 'row';

  const userContainer = createElement({
    type: 'div',
    classList: ['user-list-item'],
  });

  const userImage = createElement({ type: 'img', classList: ['user-image'] });
  userImage.src = imageUrl || defaultAvatar;
  userImage.alt = userName;

  const userNameElement = createElement({
    type: 'p',
    classList: ['user-name'],
  });
  userNameElement.textContent = userName;

  userContainer.appendChild(userImage);
  userContainer.appendChild(userNameElement);
  userCell.appendChild(userContainer);
  row.appendChild(userCell);

  standupStatus.forEach((status) => {
    const statusCell = createElement({ type: 'td', classList: ['status'] });
    statusCell.textContent = status;

    const tooltip = createElement({ type: 'div', classList: ['tooltiptext'] });

    const completedText = createElement({
      type: 'p',
      classList: ['today-standup'],
    });

    const yesterdayStandup = createElement({
      type: 'p',
      classList: ['yesterday-standup'],
    });

    const blockers = createElement({ type: 'p', classList: ['blockers'] });

    const noStandupText = createElement({
      type: 'p',
      classList: ['no-standup-text'],
    });

    if (standupText) {
      completedText.textContent += `: ${standupText?.completed}`;
      yesterdayStandup.textContent += `: ${standupText?.planned}`;
      blockers.textContent += `: ${standupText?.blockers}`;
      tooltip.appendChild(completedText);
      tooltip.appendChild(yesterdayStandup);
      tooltip.appendChild(blockers);
    } else {
      noStandupText.textContent = 'No Standup';
      tooltip.appendChild(noStandupText);
    }

    statusCell.appendChild(tooltip);

    row.addEventListener('mouseover', (e) => {
      const tooltip = e.target.querySelector('.tooltiptext');
      if (tooltip) {
        tooltip.style.visibility = 'visible';
      }
    });

    row.addEventListener('mouseout', (e) => {
      const tooltip = e.target.querySelector('.tooltiptext');
      if (tooltip) {
        tooltip.style.visibility = 'hidden';
      }
    });

    row.appendChild(statusCell);
  });

  return row;
}

function initializeTable() {
  const tableHeader = renderTableHeader();
  table.appendChild(tableHeader);
  table.appendChild(tableBody);
  tableContainer.innerHTML = '';
  tableContainer.appendChild(table);
}

async function searchButtonHandler() {
  const usernames = userInput.value.split(',');
  tableBody.innerHTML = '';

  if (usernames.length === 0 || usernames[0].trim() === '') {
    tableContainer.innerHTML = 'Please enter usernames to search.';
    return;
  }

  for (const username of usernames) {
    try {
      const { id, picture } = await getUserData(username.trim());
      const standupData = await getStandupData(id);
      const statusArray = getStatusArray(standupData);
      const tableRow = renderTableRow({
        userName: username.trim(),
        imageUrl: picture?.url,
        standupStatus: statusArray,
        standupText: standupData,
      });
      tableBody.appendChild(tableRow);
    } catch (error) {
      console.error(`Error fetching data for user: ${username.trim()}`, error);
    }
  }

  if (tableBody.firstChild) {
    table.appendChild(tableBody);
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
  } else {
    tableContainer.innerHTML = 'No matching users found.';
  }
}

function handleKeyPress(event) {
  if (event.keyCode === 13) {
    searchButtonHandler();
  }
}

initializeTable();
searchButton.addEventListener('click', searchButtonHandler);
userInput.addEventListener('keyup', handleKeyPress);
