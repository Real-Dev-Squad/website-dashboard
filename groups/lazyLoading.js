import { getDiscordGroupsPaginated } from './utils.js';
import { renderLoader, removeLoader, renderMoreGroups } from './render.js';
import { getParamValueFromURL } from './utils.js';
import { groupCardOnAction } from './script.js';

const isDevMode = getParamValueFromURL('dev') === 'true';

let currentPage = null;
let isFetching = false;
let hasNextPage = true;

if (isDevMode) {
  document.addEventListener('DOMContentLoaded', () => {
    bindLazyLoading();
    loadMoreGroups();
  });
}

async function loadMoreGroups() {
  if (isFetching || !hasNextPage) return;
  isFetching = true;
  renderLoader();

  try {
    const { groups, nextPageUrl } =
      currentPage === null
        ? await getDiscordGroupsPaginated()
        : await getDiscordGroupsPaginated(currentPage, 10);

    console.log('Fetched groups:', groups);

    if (!groups || groups.length === 0) {
      hasNextPage = false;
      removeLoader();
      return;
    }

    renderMoreGroups({ groups, cardOnClick: groupCardOnAction });

    currentPage = nextPageUrl
      ? currentPage === null
        ? 1
        : currentPage + 1
      : null;
    hasNextPage = !!nextPageUrl;
  } catch (error) {
    console.error('Error fetching more groups:', error);
  } finally {
    removeLoader();
    isFetching = false;
  }
}

function bindLazyLoading() {
  window.addEventListener('scroll', () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      !isFetching
    ) {
      loadMoreGroups();
    }
  });
}
