const usersInput = document.getElementById('user-search-input');
const searchButton = document.getElementById('search-button');
const tableContainer = document.getElementById('table-container');
let username = [];
const table = document.createElement('table');
table.classList.add('user-standup-table');
const tableBody = document.createElement('tbody');
async function makeApiCall(
  url,
  method = 'get',
  body = null,
  credentials = 'include',
  headers = { 'content-type': 'application/json' },
  options = null,
) {
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
const getUserData = async (username) => {
  const response = await makeApiCall(`${RDS_API_USERS}/${username}`);
  const data = await response.json();
  return data.user;
};
const getStandupData = async (userId) => {
  const response = await makeApiCall(`${RDS_API_STANDUP}${userId}`);
  const data = await response.json();
  return data.data;
};
function getStatusArray(apiResponse) {
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
      statusArray.push('❌');
    }
  }
  return statusArray;
}
const renderTableHeader = () => {
  let thead = document.createElement('thead');
  thead.className = 'table-header';
  let tr = document.createElement('tr');
  tr.className = 'table-header';
  let th = document.createElement('th');
  th.className = 'user date table-head';
  th.innerHTML = 'DATES ➡️<hr />USERS ⬇️';
  tr.appendChild(th);
  let currentDate = new Date();
  let currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  let currentYear = currentDate.getFullYear();
  let daysInMonth = new Date(
    currentYear,
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    let dateCell = document.createElement('th');
    dateCell.scope = 'col';
    dateCell.className = 'date';
    dateCell.innerHTML = day + ' ' + currentMonth + ' ' + currentYear;
    tr.appendChild(dateCell);
  }
  thead.appendChild(tr);
  return thead;
};
const tableHeader = renderTableHeader();
table.appendChild(tableHeader);
tableContainer.appendChild(table);
const renderTableBody = (usersName, imageUrl, standupStatus) => {
  const tr = document.createElement('tr');
  tr.className = 'table-row';
  const td = document.createElement('td');
  td.scope = 'row';
  td.className = 'user';
  const div = document.createElement('div');
  div.className = 'user-list-item';
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = usersName;
  img.className = 'user-image';
  const p = document.createElement('p');
  p.className = 'user-name';
  p.innerHTML = usersName;
  div.appendChild(img);
  div.appendChild(p);
  td.appendChild(div);
  tr.appendChild(td);
  standupStatus.forEach((status) => {
    const td = document.createElement('td');
    td.innerHTML = status;
    tr.appendChild(td);
  });
  return tr;
};
const searchButtonHandler = async () => {
  username = usersInput.value.split(',');
  username.forEach(async (user) => {
    const userData = await getUserData(user);
    const standupData = await getStandupData(userData.id);
    const statusArray = getStatusArray(standupData);
    const tr = renderTableBody(user, userData?.picture?.url, statusArray);
    tableBody.appendChild(tr);
    table.appendChild(tableBody);
  });
};
searchButton.addEventListener('click', searchButtonHandler);
