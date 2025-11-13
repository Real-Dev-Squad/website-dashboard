import { fetchOverdueTasks } from './utils.js';

const FETCH_BUTTON = document.getElementById('fetchOverdue');
const TABLE = document.getElementById('table');

FETCH_BUTTON.addEventListener('click', async () => {
  const { message, overdueTasks } = await fetchOverdueTasks();
  const keys = Object.keys(overdueTasks[0]);

  console.log(keys);

  let newHeader = document.createElement('thead');
  let newHeaderRow = document.createElement('tr');
  keys?.map((item) => {
    let newHeader = document.createElement('td');
    newHeader.setAttribute('key', item);
    newHeader.textContent = item;
    newHeaderRow.appendChild(newHeader);
    return;
  });
  newHeader.appendChild(newHeaderRow);
  TABLE.appendChild(newHeader);
  let tableBody = document.createElement('tbody');

  overdueTasks?.map((task) => {
    let values = Object.values(task);

    let newRow = document.createElement('tr');
    newRow.setAttribute('key', task?.id);

    values?.map((val) => {
      let column = document.createElement('td');
      column.textContent = JSON.stringify(val || '-');
      column.setAttribute('key', val);
      newRow.appendChild(column);
      return;
    });
    tableBody.appendChild(newRow);

    return;
  });

  TABLE.appendChild(tableBody);
});
