import { getDiscordGroupsPaginated } from './utils.js';
import {
  renderLoader,
  removeLoader,
  renderMoreGroups,
  renderLoadingCards,
  removeLoadingCards,
} from './render.js';
import { getParamValueFromURL } from './utils.js';
import { groupCardOnAction, dataStore } from './script.js';

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

  renderLoadingCards(); // ✅ Show shimmer instead of white screen

  try {
    const { groups: rawGroups, nextPageUrl } =
      currentPage === null
        ? await getDiscordGroupsPaginated()
        : await getDiscordGroupsPaginated(currentPage, 10);

    if (!rawGroups || rawGroups.length === 0) {
      hasNextPage = false;
      removeLoader();
      return;
    }

    const formattedGroups = rawGroups.map((group) => ({
      ...group,
      title: group.rolename
        .replace('group-', '')
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    }));

    if (!dataStore.groups) {
      dataStore.groups = {};
    }

    formattedGroups.forEach((group) => {
      dataStore.groups[group.id] = {
        ...group,
        count: group.memberCount,
        isMember: group.isMember,
        isUpdating: false,
      };
    });

    dataStore.filteredGroupsIds = Object.keys(dataStore.groups);

    renderMoreGroups({
      groups: formattedGroups,
      cardOnClick: groupCardOnAction,
    });

    currentPage = nextPageUrl
      ? currentPage === null
        ? 1
        : currentPage + 1
      : null;
    hasNextPage = !!nextPageUrl;
  } catch (error) {
    console.error('Error fetching more groups:', error);
  } finally {
    removeLoadingCards();
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
