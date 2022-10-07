function createElement({ type, attributes = {}, innerText }) {
  const element = document.createElement(type);
  Object.keys(attributes).forEach((item) => {
    element.setAttribute(item, attributes[item]);
  });
  element.textContent = innerText;
  return element;
}

function addLoader(container) {
  const loader = createElement({
    type: 'div',
    attributes: { class: 'loader' },
  });
  const loaderP = createElement({
    type: 'p',
    attributes: { class: 'loaderP' },
    innerText: 'Loading...',
  });
  loader.appendChild(loaderP);
  container.appendChild(loader);
}

function addErrorMessage(container) {
  const errorDiv = createElement({
    type: 'div',
    attributes: { class: 'error-div' },
  });
  const errorMsg = createElement({
    type: 'p',
    attributes: { class: 'error-message' },
    innerText: 'Something went wrong!',
  });
  errorDiv.appendChild(errorMsg);
  container.appendChild(errorDiv);
}

function createSummarySection(username, log, isAllTasks, createModalFunction) {
  const summary = createElement({
    type: 'summary',
    attributes: { class: 'summary' },
  });

  const summaryContainer = createElement({
    type: 'div',
    attributes: { class: 'summaryContainer' },
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

function createDetailsSection(title, purpose, category, level) {
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
  const tasktitle = createElement({
    type: 'span',
    attributes: { class: 'task-title' },
    innerText: 'Title: ',
  });
  const titleDetail = createElement({
    type: 'span',
    attributes: { class: 'task-title-detail' },
    innerText: title,
  });

  taskTitleDiv.appendChild(tasktitle);
  taskTitleDiv.appendChild(titleDetail);

  details.appendChild(taskTitleDiv);

  const taskPurposeDiv = createElement({
    type: 'div',
    attributes: { class: 'task-purpose-div' },
  });
  const taskPurpose = createElement({
    type: 'span',
    attributes: { class: 'task-purpose' },
    innerText: 'Purpose: ',
  });
  const taskPurposeDetail = createElement({
    type: 'span',
    attributes: { class: 'task-purpose-detail' },
    innerText: purpose,
  });

  taskPurposeDiv.appendChild(taskPurpose);
  taskPurposeDiv.appendChild(taskPurposeDetail);

  details.appendChild(taskPurposeDiv);

  if (category) {
    const taskCategoryDiv = createElement({
      type: 'div',
      attributes: { class: 'task-cateogory-div' },
    });
    const taskCategory = createElement({
      type: 'span',
      attributes: { class: 'task-category' },
      innerText: 'category: ',
    });
    const taskCategoryDetail = createElement({
      type: 'span',
      attributes: { class: 'task-category-detail' },
      innerText: category,
    });

    taskCategoryDiv.appendChild(taskCategory);
    taskCategoryDiv.appendChild(taskCategoryDetail);
    details.appendChild(taskCategoryDiv);
  }

  if (level) {
    const taskLevelDiv = createElement({
      type: 'div',
      attributes: { class: 'task-level-div' },
    });
    const taskLevel = createElement({
      type: 'span',
      attributes: { class: 'task-level' },
      innerText: 'Level: ',
    });
    const taskLevelDetail = createElement({
      type: 'span',
      attributes: { class: 'task-level-detail' },
      innerText: level,
    });

    taskLevelDiv.appendChild(taskLevel);
    taskLevelDiv.appendChild(taskLevelDetail);
    details.appendChild(taskLevelDiv);
  }

  detailsContainer.appendChild(details);

  return detailsContainer;
}

export {
  createElement,
  addLoader,
  addErrorMessage,
  createSummarySection,
  createDetailsSection,
};
