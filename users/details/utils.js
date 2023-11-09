async function makeApiCall(
  url,
  method = 'get',
  body = null,
  headers = [],
  options = null,
) {
  try {
    const response = await fetch(url, {
      method,
      body,
      headers,
      ...options,
    });
    return response;
  } catch (err) {
    console.error(MESSAGE_SOMETHING_WENT_WRONG, err);
    return err;
  }
}
function generateNoDataFoundSection(message) {
  document.title = 'User Not Found';
  const notFoundDiv = createElement({ type: 'div', classList: ['not-found'] });
  const notFoundImg = createElement({
    type: 'img',
    classList: ['not-found-img'],
  });
  notFoundImg.src = '/images/page-not-found.png';
  notFoundImg.setAttribute('alt', 'page not found');
  const notFoundText = createElement({
    type: 'h1',
    classList: ['not-found-text-h1'],
  });
  notFoundText.appendChild(createTextNode(message));
  notFoundDiv.append(notFoundImg, notFoundText);
  const container = document.querySelector('.user-details-header');
  container.appendChild(notFoundDiv);
}

function inputParser(input) {
  const parsedDate = new Date(parseInt(input, 10) * 1000);
  return parsedDate;
}

/**
 * Calculates the percentage of days remaining between two dates.
 *
 * @param {Date} startedOn - The start date of the task.
 * @param {Date} endsOn - The end date of the task.
 * @returns {number} The percentage of days remaining as a value between 0 and 100.
 */
const getPercentageOfDaysLeft = (startedOn, endsOn) => {
  const startDate = inputParser(startedOn);
  const endDate = inputParser(endsOn);
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  const currentDate = new Date();
  const daysLeft = Math.floor((endDate - currentDate) / (1000 * 60 * 60 * 24));
  const percentageOfDaysLeft = (daysLeft / totalDays) * 100;
  return percentageOfDaysLeft;
};

/**
 * Determines the color code based on the progress of a task.
 *
 * @param {number} percentCompleted - The percentage of the task completed.
 * @param {Date} startedOn - The date the task was started.
 * @param {Date} endsOn - The date the task is expected to end.
 * @returns {string} The color code representing the progress status:
 */
const handleProgressColor = (percentCompleted, startedOn, endsOn) => {
  const percentageOfDaysLeft = getPercentageOfDaysLeft(startedOn, endsOn);
  const percentIncomplete = 100 - percentCompleted;
  if (percentCompleted === 100 || percentageOfDaysLeft >= percentIncomplete) {
    return 'green';
  }

  if (
    (percentageOfDaysLeft < 25 && percentIncomplete > 35) ||
    (percentageOfDaysLeft <= 0 && percentIncomplete > 0)
  ) {
    return 'red';
  }

  if (percentageOfDaysLeft < 50 && percentIncomplete > 75) {
    return 'orange';
  }

  return 'yellow';
};
/**
 * Verify if element's border bottom is in the view or not
 * @param {HTML element} element - UI Element
 * @returns {boolean}
 */
function isBottomBorderInView(element) {
  const rect = element.getBoundingClientRect();
  return rect.bottom <= window.innerHeight;
}

/**
 * Calculates the percentage of days remaining between two dates.
 *
 * @param {Object} task - Task from list of tasks assigned to a user
 * @returns {number} A new UI HTML for better UI/UX
 */
const generateCardUIInDev = (task) => {
  const isDeadLineCrossed = Date.now() > task.endsOn * 1000;
  const isTaskRed =
    isDeadLineCrossed &&
    task?.percentCompleted !== 0 &&
    task?.status !== 'COMPLETED';

  const deadlineDays = task?.endsOn
    ? dateDiff(Date.now(), task.endsOn * 1000, (d) =>
        isDeadLineCrossed ? d + ' ago' : 'in ' + d,
      )
    : 'N/A';
  const progressBarClassname = handleProgressColor(
    task?.percentCompleted,
    task?.startedOn,
    task?.endsOn,
  );
  const startedOnDays = task?.startedOn
    ? dateDiff(Date.now(), task?.startedOn * 1000, (d) => d + ' ago')
    : 'N/A';

  return `
  <div class="task ${isTaskRed ? 'task-red' : ''}">
    <div class="row">
      <div class="task-title">
        <a data-test-tile = ${task?.title} >${task?.title}</a>
      </div>
    ${
      !noProgressbarStatuses.includes(task.status)
        ? `<div class="progress-content">
            <progress class=${
              task?.percentCompleted > 0 ? progressBarClassname : ''
            } id="file" value="${task?.percentCompleted}" max="100"> ${
            task?.percentCompleted
          } </progress>
            <div>${task?.percentCompleted ?? 'N/A'}%</div>
          </div>`
        : ''
    }
    </div>
    <div class="row">
      <div class="detail-block eta">
        <p class="div-heading">Estimated Completion</p>
        <p class="div-detail">${deadlineDays || 'N/A'}</p>
      </div>
      <div class="detail-block status">
        <p class="div-heading">Status</p>
        <p class="div-detail">${READABLE_STATUS[task.status] || 'N/A'}</p>
      </div>
    </div>
    <div class="row">
      <div class="detail-block startedOn">
        <p class="div-heading">Started On</p>
        <p class="div-detail">${startedOnDays || 'N/A'}</p>
      </div>
      <div class="detail-block priority">
        <p class="div-heading">Priority</p>
        <p class="div-detail">${task?.priority || 'N/A'}</p>
      </div>
    </div>
    <div class="row">
      <div class="detail-block createdBy">
        <p class="div-heading">Created By</p>
        <p class="div-detail">${task?.createdBy || 'N/A'}</p>
      </div>
      <div class="detail-block type">
        <p class="div-heading">Type</p>
        <p class="div-detail">${task?.type || 'N/A'}</p>
      </div>
    </div>
  </div>
  `;
};
