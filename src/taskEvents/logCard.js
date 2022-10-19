import { createElement } from './utils.js';

function createSummarySection({
  username,
  log,
  isAllTasks,
  createModalFunction,
}) {
  const summary = createElement({
    type: 'summary',
    attributes: { class: 'summary' },
  });

  const summaryContainer = createElement({
    type: 'div',
    attributes: { class: 'summary-container' },
  });

  if (isAllTasks) {
    const name = createElement({
      type: 'button',
      attributes: { class: 'name' },
      innerText: username,
    });
    name.addEventListener('click', () => createModalFunction(username));
    summaryContainer.appendChild(name);
  }
  const tasklog = createElement({
    type: 'p',
    attributes: { class: 'log' },
    innerText: log,
  });
  const icon = createElement({
    type: 'img',
    attributes: {
      class: 'dropDown',
      src: './assets/down.png',
      alt: 'dropdown icon',
    },
  });

  summaryContainer.appendChild(tasklog);
  summary.appendChild(summaryContainer);
  summary.appendChild(icon);

  return summary;
}

function createDetailsSection({ title, purpose, category, level }) {
  const detailsContainer = createElement({
    type: 'div',
    attributes: { class: 'details-div-container' },
  });
  const details = createElement({
    type: 'div',
    attributes: { class: 'details-div' },
  });

  const taskTitleDiv = createElement({
    type: 'div',
    attributes: { class: 'task-title-div' },
  });
  const taskTitleLabel = createElement({
    type: 'span',
    attributes: { class: 'task-title-label' },
    innerText: 'Title: ',
  });
  const titleDetail = createElement({
    type: 'span',
    attributes: { class: 'task-title-detail' },
    innerText: title,
  });

  taskTitleDiv.appendChild(taskTitleLabel);
  taskTitleDiv.appendChild(titleDetail);

  details.appendChild(taskTitleDiv);

  const taskPurposeDiv = createElement({
    type: 'div',
    attributes: { class: 'task-purpose-div' },
  });
  const taskPurposeLabel = createElement({
    type: 'span',
    attributes: { class: 'task-purpose-label' },
    innerText: 'Purpose: ',
  });
  const taskPurposeDetail = createElement({
    type: 'span',
    attributes: { class: 'task-purpose-detail' },
    innerText: purpose,
  });

  taskPurposeDiv.appendChild(taskPurposeLabel);
  taskPurposeDiv.appendChild(taskPurposeDetail);

  details.appendChild(taskPurposeDiv);

  if (category) {
    const taskCategoryDiv = createElement({
      type: 'div',
      attributes: { class: 'task-cateogory-div' },
    });
    const taskCategoryLabel = createElement({
      type: 'span',
      attributes: { class: 'task-category-label' },
      innerText: 'category: ',
    });
    const taskCategoryDetail = createElement({
      type: 'span',
      attributes: { class: 'task-category-detail' },
      innerText: category,
    });

    taskCategoryDiv.appendChild(taskCategoryLabel);
    taskCategoryDiv.appendChild(taskCategoryDetail);
    details.appendChild(taskCategoryDiv);
  }

  if (level) {
    const taskLevelDiv = createElement({
      type: 'div',
      attributes: { class: 'task-level-div' },
    });
    const taskLevelLabel = createElement({
      type: 'span',
      attributes: { class: 'task-level-label' },
      innerText: 'Level: ',
    });
    const taskLevelDetail = createElement({
      type: 'span',
      attributes: { class: 'task-level-detail' },
      innerText: level,
    });

    taskLevelDiv.appendChild(taskLevelLabel);
    taskLevelDiv.appendChild(taskLevelDetail);
    details.appendChild(taskLevelDiv);
  }

  detailsContainer.appendChild(details);

  return detailsContainer;
}

function createEventCard({
  container,
  title,
  log,
  purpose,
  username,
  category,
  level,
  isAllTasks,
  createModal,
}) {
  const eventcard = createElement({
    type: 'details',
    attributes: { class: 'event_card' },
  });

  const summary = createSummarySection({
    isAllTasks,
    username,
    createModalFunction: createModal,
    log,
  });
  const details = createDetailsSection({ title, purpose, category, level });

  eventcard.appendChild(summary);
  eventcard.appendChild(details);
  container.append(eventcard);
}

export { createEventCard };
