function renderFilterComponent({
  filterComponent,
  page,
  parentContainer,
  renderFunction,
  otherFilters = null,
}) {
  const filterContainer = document.createElement('div');
  filterContainer.className = 'filter__component__container';
  filterContainer.setAttribute('data-testid', 'filter-component-container');

  const shouldAllowMultipleSelection =
    page !== 'requests' && page !== 'applications';
  filterContainer.innerHTML = `
      <button
        id="filter-component-toggle-button"
        class="filter__component__toggle__button"
        data-testid="filter-component-toggle-button"
      >
        <span class="filter__component__label" data-testid="filter-component-label">
          Filters
        </span>
        <img
          class="filter__component__icon"
          src="/images/filter-icon.svg"
          alt="Filter icon"
          data-testid="filter-component-icon"
        />
      </button>
  
      <div
        class="filter__component__modal hidden"
        id="filter-component-modal"
        data-testid="filter-component-modal"
      >
        <div
          class="filter__component__options__container"
          id="filter-component-options-container"
          data-testid="filter-component-options-container"
        ></div>
        <button
          id="apply-filter-component-button"
          class="apply__filter__component__button"
          data-testid="apply-filter-component-button"
        >
          Apply Filter
        </button>
      </div>
    `;

  filterComponent.appendChild(filterContainer);

  const filterButton = document.getElementById(
    'filter-component-toggle-button',
  );
  const filterModal = document.getElementById('filter-component-modal');
  const applyFilterButton = document.getElementById(
    'apply-filter-component-button',
  );

  function populateStatusFilters(page) {
    let statusList = [
      { name: 'Approved', id: 'APPROVED' },
      { name: 'Pending', id: 'PENDING' },
      { name: 'Rejected', id: 'REJECTED' },
    ];

    if (page === 'extension-requests') {
      statusList = statusList.map((status) =>
        status.id === 'REJECTED'
          ? { ...status, name: 'Denied', id: 'DENIED' }
          : status,
      );
    } else if (page === 'applications') {
      statusList = statusList.map((status) =>
        status.id === 'APPROVED'
          ? { ...status, name: 'Accepted', id: 'ACCEPTED' }
          : status,
      );
    }
    const filterHeader = document.createElement('div');
    filterHeader.className = 'filter__component__header';

    const filterTitle = document.createElement('p');
    filterTitle.className = 'filter__component__title';
    filterTitle.textContent = 'Filter By Status';

    const clearFilterButton = document.createElement('button');
    clearFilterButton.className = 'filter__component__clear__button';
    clearFilterButton.id = 'filter-component-clear-button';
    clearFilterButton.textContent = 'Clear';
    clearFilterButton.disabled = true;
    clearFilterButton.setAttribute(
      'data-testid',
      'filter-component-clear-button',
    );

    filterHeader.append(filterTitle);

    clearFilterButton.addEventListener('click', async function () {
      filterModal.classList.add('hidden');
      deselectAllCheckboxes();
      const tagContainer = document.getElementById('active-filter-tags');
      tagContainer.innerHTML = '';

      updateQueryParamInUrl(null, page);
      clearFilterButton.disabled = true;
      await renderFunctionFinal({
        renderFunction,
        filterStatus: null,
        page,
        parentContainer,
        otherFilters,
      });
    });

    filterTitle.appendChild(clearFilterButton);
    document
      .querySelector('#filter-component-options-container')
      .prepend(filterHeader);

    for (const { name, id } of statusList) {
      addFilterCheckbox(name, id);
    }
  }

  function toggleFilter() {
    filterModal.classList.toggle('hidden');
  }

  document.addEventListener('click', (event) => {
    if (
      !filterModal.classList.contains('hidden') &&
      !filterModal.contains(event.target) &&
      event.target !== filterButton
    ) {
      closeFilter();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !filterModal.classList.contains('hidden')) {
      closeFilter();
    }
  });

  function closeFilter() {
    filterModal.classList.add('hidden');
  }

  filterButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleFilter();
  });

  applyFilterButton.addEventListener('click', async (event) => {
    closeFilter();

    const selectedStatuses = getSelectedStatuses();
    updateQueryParamInUrl(selectedStatuses, page);
    renderSelectedTags(selectedStatuses);

    await renderFunctionFinal({
      renderFunction,
      filterStatus: selectedStatuses,
      page,
      parentContainer,
      otherFilters,
    });
  });

  populateStatusFilters(page);

  const clearFilterButton = document.getElementById(
    'filter-component-clear-button',
  );

  function checkQueryStatus() {
    const clearFilterButton = document.getElementById(
      'filter-component-clear-button',
    );

    const urlParams = new URLSearchParams(window.location.search);
    let qParam = urlParams.get('q');
    let statusParam = urlParams.get('status');
    let statusValues = [];

    if (qParam) {
      const statusMatch = qParam.match(/status:([^&]+)/);
      if (statusMatch) {
        statusValues = statusMatch[1].split('+');
      }
    } else if (statusParam) {
      statusValues = statusParam.includes('+')
        ? statusParam.split('+')
        : statusParam.includes(',')
        ? statusParam.split(',')
        : [statusParam];
    }

    if (page === 'applications') {
      statusValues = statusValues.map((status) => status.toUpperCase());
    }
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = statusValues.includes(checkbox.id);
    });
    if (statusValues.length > 0) {
      clearFilterButton.disabled = false;
    }
    renderSelectedTags(statusValues);
  }

  function addFilterCheckbox(labelText, value) {
    const group = document.getElementById('filter-component-options-container');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');

    checkbox.type = 'checkbox';
    checkbox.value = value;
    checkbox.id = value;

    checkbox.addEventListener('change', () => {
      if (!shouldAllowMultipleSelection && checkbox.checked) {
        const checkboxes = group.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((cb) => {
          if (cb !== checkbox) cb.checked = false;
        });
      }
      const anyChecked =
        group.querySelectorAll('input[type="checkbox"]:checked').length > 0;
      clearFilterButton.disabled = !anyChecked;
    });

    label.setAttribute('for', value);
    label.textContent = labelText;
    label.prepend(checkbox);
    label.appendChild(document.createElement('br'));
    label.classList.add('filter__component__status__filter');

    group.appendChild(label);
    checkQueryStatus();
  }

  function renderSelectedTags(statuses) {
    const tagContainer = document.getElementById('active-filter-tags');
    if (page === 'extension-requests') {
      tagContainer.classList.add('extension-page-padding');
    }
    const oldTags = tagContainer.querySelectorAll('.filter__component__tag');
    oldTags.forEach((oldTag) => {
      oldTag.remove();
    });

    const validCheckboxIds = getAllValidCheckboxIds();
    const validStatuses = statuses.filter((status) =>
      validCheckboxIds.includes(status),
    );

    validStatuses.forEach((status) => {
      const tag = document.createElement('div');
      tag.className = 'filter__component__tag';
      tag.id = '';
      tag.setAttribute('data-status', status);
      tag.textContent = status.charAt(0) + status.slice(1).toLowerCase();

      const removeTag = document.createElement('img');
      removeTag.className = 'filter__component__tag__close';
      removeTag.src = '/images/x-icon-purple.svg';
      removeTag.style.cursor = 'pointer';

      removeTag.addEventListener('click', async () => {
        const checkbox = document.getElementById(status);
        if (checkbox) {
          checkbox.checked = false;
          checkbox.dispatchEvent(new Event('change'));
        }

        tag.remove();

        const updatedStatuses = getSelectedStatuses();
        clearFilterButton.disabled = updatedStatuses.length === 0;

        updateQueryParamInUrl(updatedStatuses, page);

        await renderFunctionFinal({
          renderFunction,
          filterStatus: updatedStatuses,
          page,
          parentContainer,
          otherFilters,
        });
      });

      tag.appendChild(removeTag);
      tagContainer.appendChild(tag);
    });
  }
}

function deselectAllCheckboxes() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
}

function getSelectedStatuses() {
  const container = document.getElementById(
    'filter-component-options-container',
  );
  const checkboxes = container.querySelectorAll(
    'input[type="checkbox"]:checked',
  );
  return Array.from(checkboxes).map((cb) => cb.value);
}

function updateQueryParamInUrl(queryParamVal, page) {
  const currentUrlParams = new URLSearchParams(window.location.search);
  currentUrlParams.delete('status');
  currentUrlParams.delete('q');

  if (queryParamVal && queryParamVal.length > 0) {
    if (page === 'extension-requests') {
      const formattedValue = Array.isArray(queryParamVal)
        ? queryParamVal.join('+')
        : queryParamVal;
      currentUrlParams.set('q', `status:${formattedValue}`);
    } else {
      const formattedValue = Array.isArray(queryParamVal)
        ? queryParamVal.join(',')
        : queryParamVal;
      currentUrlParams.set('status', formattedValue);
    }
  }
  let updatedUrl;
  if (page !== 'extension-requests') {
    updatedUrl = `/${page}?${currentUrlParams.toString().toLowerCase()}`;
  } else {
    updatedUrl = `/${page}?${currentUrlParams.toString()}`;
  }

  window.history.replaceState(window.history.state, '', updatedUrl);
}

function getAllValidCheckboxIds() {
  const group = document.getElementById('filter-component-options-container');
  return Array.from(group.querySelectorAll('input[type="checkbox"]')).map(
    (cb) => cb.id,
  );
}

async function renderFunctionFinal({
  renderFunction,
  filterStatus,
  page,
  parentContainer,
  otherFilters,
}) {
  if (page === 'requests') {
    parentContainer.innerHTML = '';
    const params = new URLSearchParams(window.location.search);
    let currentReqType = params.get('type')?.toUpperCase() ?? 'OOO';
    await renderFunction({
      state: filterStatus?.length > 0 ? filterStatus : null,
      sort: otherFilters?.sort,
      requestType: currentReqType,
    });
  } else if (page === 'extension-requests') {
    parentContainer.innerHTML = '';
    otherFilters.status = filterStatus?.length > 0 ? filterStatus : '';
    await renderFunction(otherFilters);
  } else if (page === 'applications') {
    parentContainer.innerHTML = '';

    await renderFunction('', filterStatus[0]?.toLowerCase());
  } else if (page === 'task-requests') {
    parentContainer.innerHTML = '';
    const filterStatus = filterStatus.map((status) => status.toLowerCase());
    otherFilters.status = filterStatus?.length > 0 ? filterStatus : '';
    await renderFunction(otherFilters);
  }
}
