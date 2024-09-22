'use strict';
import {
  removeGroupCreationModal,
  removeLoadingCards,
  removeLoadingNavbarProfile,
  renderGroupById,
  renderGroupCreationModal,
  renderLoadingCards,
  renderNoGroupFound,
  renderLoadingNavbarProfile,
  renderNavbarProfile,
  renderNavbarProfileSignin,
  renderNotAuthenticatedPage,
} from './render.js';
import {
  addGroupRoleToMember,
  createDiscordGroupRole,
  getPaginatedDiscordGroups,
  getUserGroupRoles,
  getUserSelf,
  removeRoleFromMember,
  getDiscordGroupIdsFromSearch,
  getParamValueFromURL,
  setParamValueInURL,
} from './utils.js';

const QUERY_PARAM_KEY = {
  DEV_FEATURE_FLAG: 'dev',
  GROUP_SEARCH: 'name',
};
const isDev = getParamValueFromURL(QUERY_PARAM_KEY.DEV_FEATURE_FLAG) === 'true';

const handler = {
  set: (obj, prop, value) => {
    switch (prop) {
      case 'groups':
        const oldGroups = obj.groups;
        const newGroups = value;

        obj[prop] = value;

        // Rerender only the groups that have changed
        const diffGroups = Object.values(newGroups)
          .filter(
            (ng) => JSON.stringify(oldGroups?.[ng.id]) !== JSON.stringify(ng),
          )
          .filter((ng) => dataStore.filteredGroupsIds.includes(ng.id));
        diffGroups.forEach((group) =>
          renderGroupById({
            group,
            cardOnClick: () => groupCardOnAction(group.id),
          }),
        );
        break;
      case 'filteredGroupsIds':
        const oldFilteredGroupsIds = obj.filteredGroupsIds;
        obj[prop] = value;

        if (oldFilteredGroupsIds == null) break;
        // Optimization possible: Only rerender groups that have been added/removed
        renderAllGroups({
          cardOnClick: groupCardOnAction,
        });
        if (isDev && (!value || value.length == 0)) renderNoGroupFound();
        break;
      case 'search':
        if (isDev) {
          setParamValueInURL(QUERY_PARAM_KEY.GROUP_SEARCH, value);
          dataStore.filteredGroupsIds = getDiscordGroupIdsFromSearch(
            Object.values(dataStore.groups),
            value,
          );
        } else if (value === '') {
          if (dataStore.groups == null) break;
          dataStore.filteredGroupsIds = Object.values(dataStore.groups).map(
            (group) => group.id,
          );
        } else {
          const search = value.toLowerCase();
          dataStore.filteredGroupsIds = Object.values(dataStore.groups)
            .filter((group) => group.title.toLowerCase().includes(search))
            .map((group) => group.id);
        }
        obj[prop] = value;
        break;
      case 'isGroupCreationModalOpen':
        obj[prop] = value;

        if (value) {
          renderGroupCreationModal({
            onClose: () => (dataStore.isGroupCreationModalOpen = false),
            onSubmit: ({ title, description }) => {
              return createDiscordGroupRole({
                rolename: title,
                ...(description && { description }),
              }).then(() => {
                showToaster('Group created successfully');
                dataStore.isGroupCreationModalOpen = false;

                // Future improvement: Use a more robust way to refresh the data
                setTimeout(() => location.reload(), 2500);
              });
            },
          });
        } else {
          removeGroupCreationModal();
        }
        break;
      case 'userSelf':
        obj[prop] = value;
        break;
      case 'discordId':
      case 'isLoading':
      case 'hasMoreGroups':
        obj[prop] = value;
        break;
      default:
        throw new Error('Invalid property set');
    }
    return true;
  },
};

const dataStore = new Proxy(
  {
    userSelf: null,
    groups: null,
    filteredGroupsIds: [],
    search: isDev ? getParamValueFromURL(QUERY_PARAM_KEY.GROUP_SEARCH) : '',
    discordId: null,
    isGroupCreationModalOpen: false,
    isLoading: false,
    hasMoreGroups: true,
  },
  handler,
);

// Lifecycle functions

const onCreate = () => {
  renderLoadingCards();
  renderLoadingNavbarProfile();

  getUserSelf()
    .then(async (data) => {
      if (data.statusCode === 401) {
        renderNavbarProfileSignin();
        renderNotAuthenticatedPage();
        return;
      } else if (data.error) {
        throw new Error(data);
      }
      dataStore.userSelf = data;
      removeLoadingCards();
      removeLoadingNavbarProfile();
      await afterAuthentication();
    })
    .catch((err) => {
      if (err.message) {
        showToaster(err.message);
      }

      console.error(err);
    })
    .finally(() => {
      removeLoadingNavbarProfile();
      removeLoadingCards();
    });

  bindSearchInput();
  bindSearchFocus();
  bindGroupCreationButton();
  bindInfiniteScroll();
};
const afterAuthentication = async () => {
  renderNavbarProfile({ profile: dataStore.userSelf });
  await Promise.all([loadMoreGroups(), getUserGroupRoles()]).then(
    ([groups, roleData]) => {
      dataStore.filteredGroupsIds = groups.map((group) => group.id);
      dataStore.groups = groups.reduce((acc, group) => {
        let title = group.rolename
          .replace('group-', '')
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        acc[group.id] = {
          id: group.id,
          title: title,
          count: group.memberCount,
          isMember: group.isMember,
          roleId: group.roleid,
          description: group.description,
          isUpdating: false,
        };
        return acc;
      }, {});
      if (isDev) {
        dataStore.filteredGroupsIds = getDiscordGroupIdsFromSearch(
          Object.values(dataStore.groups),
          dataStore.search,
        );
      }
      dataStore.discordId = roleData.userId;
    },
  );
};
const loadMoreGroups = async () => {
  if (dataStore.isLoading || !dataStore.hasMoreGroups) return;
  
  dataStore.isLoading = true;
  renderLoadingCards();
  
  const newGroups = await getPaginatedDiscordGroups();
  
  removeLoadingCards();
  dataStore.isLoading = false;
  
  if (newGroups.length === 0) {
    dataStore.hasMoreGroups = false;
    return;
  }
  
  dataStore.groups = {
    ...dataStore.groups,
    ...newGroups.reduce((acc, group) => {
      acc[group.id] = {
        id: group.id,
        title: group.rolename
          .replace('group-', '')
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        count: group.memberCount,
        isMember: group.isMember,
        roleId: group.roleid,
        description: group.description,
        isUpdating: false,
      };
      return acc;
    }, {}),
  };
  
  dataStore.filteredGroupsIds = [
    ...dataStore.filteredGroupsIds,
    ...newGroups.map((group) => group.id),
  ];
  
  return newGroups;
};

// Bind Functions

const bindInfiniteScroll = () => {
  window.addEventListener('scroll', () => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 100
    ) {
      loadMoreGroups();
    }
  });
};

const bindGroupCreationButton = () => {
  const groupCreationBtn = document.querySelector('.create-group');

  groupCreationBtn.addEventListener('click', () => {
    dataStore.isGroupCreationModalOpen = true;
  });
};

const bindSearchInput = () => {
  const searchInput = document.querySelector('.search__input');
  if (isDev) searchInput.value = dataStore.search;
  searchInput.addEventListener('input', (e) => {
    dataStore.search = e.target.value;
  });
};

const bindSearchFocus = () => {
  const search = document.querySelector('.search');
  const searchInput = document.querySelector('.search__input');
  search.addEventListener('click', () => {
    searchInput.focus();
  });
};

// Helper functions

function showToaster(message) {
  const toaster = document.querySelector('.toast__message');
  toaster.innerText = message;
  toaster.classList.add('toast--show');

  setTimeout(() => {
    toaster.classList.remove('toast--show');
  }, 3000);
}

function updateGroup(id, group) {
  dataStore.groups = {
    ...dataStore.groups,
    [id]: {
      ...dataStore.groups[id],
      ...group,
    },
  };
}

function groupCardOnAction(id) {
  const group = dataStore.groups[id];
  updateGroup(id, { isUpdating: true });
  if (group.isMember) {
    removeRoleFromMember(group.roleId, dataStore.discordId)
      .then(() => updateGroup(id, { isMember: false, count: group.count - 1 }))
      .catch((err) => showToaster(err.message))
      .finally(() => updateGroup(id, { isUpdating: false }));
  } else {
    addGroupRoleToMember({
      roleid: group.roleId,
      userid: dataStore.discordId,
    })
      .then(() => updateGroup(id, { isMember: true, count: group.count + 1 }))
      .catch((err) => showToaster(err.message))
      .finally(() => updateGroup(id, { isUpdating: false }));
  }
}

function renderAllGroups({ cardOnClick }) {
  const mainContainer = document.querySelector('.group-container');
  mainContainer.innerHTML = '';
  dataStore.filteredGroupsIds.forEach((id) =>
    renderGroupById({
      group: dataStore.groups[id],
      cardOnClick: () => cardOnClick(id),
    }),
  );
}

onCreate();
