const userInput = document.getElementById('user-search-input');
const searchButton = document.getElementById('search-button');
const tableContainer = document.getElementById('table-container');
const table = document.createElement('table');
table.classList.add('user-standup-table');
const tableBody = document.createElement('tbody');

// Date related variables
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentDaysInMonth = new Date(
  currentYear,
  currentDate.getMonth() + 1,
  0,
).getDate();
const currentMonthString = currentDate.toLocaleString('default', {
  month: 'long',
});

// Function to fetch User Data from RDS API
async function getUserData(username) {
  const response = await makeApiCall(`${RDS_API_USERS}/${username}`);
  const data = await response.json();
  return data.user;
}

// Function to fetch Standup Data from RDS API
async function getStandupData(userId) {
  const response = await makeApiCall(`${RDS_API_STANDUP}${userId}`);
  const data = await response.json();
  return data.data;
}

// Function to Process Standup Data like completed, planned , blockers and standup frequency
function processStandupData(apiData) {
  const standupData = {
    standupFrequency: [],
    completedText: [],
    plannedText: [],
    blockersText: [],
  };
  standupData.standupFrequency = Array(currentDaysInMonth).fill('❌');
  standupData.completedText = Array(currentDaysInMonth).fill('No data');
  standupData.plannedText = Array(currentDaysInMonth).fill('No data');
  standupData.blockersText = Array(currentDaysInMonth).fill('No data');

  if (!apiData) {
    return standupData;
  }
  apiData.forEach((item) => {
    const date = new Date(item.createdAt);
    const day = date.getDate();
    const index = day - 1;
    standupData.standupFrequency[index] = '✅';
    standupData.completedText[index] = item.completed;
    standupData.plannedText[index] = item.planned;
    standupData.blockersText[index] = item.blockers;
  });
  return standupData;
}

// Function to render the table header
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
  for (let day = 1; day <= currentDaysInMonth; day++) {
    const dateCell = createElement({ type: 'th', classList: ['date'] });
    dateCell.scope = 'col';
    dateCell.textContent = day + ' ' + currentMonthString + ' ' + currentYear;
    headerRow.appendChild(dateCell);
  }
  tableHeader.appendChild(headerRow);
  return tableHeader;
}

// Function to render the table body
function renderTableRow({ userName, imageUrl, standupData }) {
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

  // Variable to store the standup data
  const standupStatus = standupData.standupFrequency;
  const completedTextData = standupData.completedText;
  const plannedText = standupData.plannedText;
  const blockersText = standupData.blockersText;

  // Loop to render the standup data for each day with tooltip
  for (let i = 0; i < currentDaysInMonth; i++) {
    const statusCell = createElement({ type: 'td', classList: ['status'] });
    statusCell.textContent = standupStatus[i];
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

    // Condition to check if standup is completed or not and render the data accordingly
    if (standupStatus[i] === '✅') {
      completedText.textContent += `Today's: ${completedTextData[i]}`;
      yesterdayStandup.textContent += `Yesterday's: ${plannedText[i]}`;
      blockers.textContent += `Blockers: ${blockersText[i]}`;

      tooltip.appendChild(completedText);
      tooltip.appendChild(yesterdayStandup);
      tooltip.appendChild(blockers);
    } else {
      noStandupText.textContent = 'No Standup';
      tooltip.appendChild(noStandupText);
    }

    statusCell.appendChild(tooltip);

    // Event listener to show and hide the tooltip
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
  }
  return row;
}

// Function to initialize the table
function initializeTable() {
  const tableHeader = renderTableHeader();
  table.appendChild(tableHeader);
  table.appendChild(tableBody);
  tableContainer.innerHTML = '';
  tableContainer.appendChild(table);
}

// Function to handle search button click
async function searchButtonHandler() {
  const usernames = userInput.value.split(',');
  tableBody.innerHTML = '';

  // Condition to check if user has entered any usernames or not
  if (usernames.length === 0 || usernames[0].trim() === '') {
    tableContainer.innerHTML = 'Please enter usernames to search.';
    return;
  }

  // Loop to fetch data for each user
  for (const username of usernames) {
    try {
      const { id, picture } = await getUserData(username.trim());
      const standupData = await getStandupData(id);
      const standupProcessedData = processStandupData(standupData);
      const tableRow = renderTableRow({
        userName: username.trim(),
        imageUrl: picture?.url,
        standupData: standupProcessedData,
      });
      tableBody.appendChild(tableRow);
    } catch (error) {
      console.error(`Error fetching data for user: ${username.trim()}`, error);
    }
  }

  // Condition to check if any matching users are found or not
  if (tableBody.firstChild) {
    table.appendChild(tableBody);
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
  } else {
    tableContainer.innerHTML = 'No matching users found.';
  }
}

// Function to handle enter key press
function handleKeyPress(event) {
  if (event.keyCode === 13) {
    searchButtonHandler();
  }
}

initializeTable();
searchButton.addEventListener('click', searchButtonHandler);
userInput.addEventListener('keyup', handleKeyPress);
