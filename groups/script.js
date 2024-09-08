'use strict';
import {
  removeGroupCreationModal,
  removeLoadingCards,
  removeLoadingNavbarProfile,
  renderGroupById,
  renderGroupCreationModal,
  renderLoadingCards,
  renderLoadingNavbarProfile,
  renderNavbarProfile,
  renderNavbarProfileSignin,
  renderNotAuthenticatedPage,
} from './render.js';
import {
  addGroupRoleToMember,
  createDiscordGroupRole,
  getDiscordGroups,
  getUserGroupRoles,
  getUserSelf,
  removeRoleFromMember,
  getDiscordGroupIdsFromSearch,
  getParamValueFromURL,
  setParamValueInURL,
} from './utils.js';

const groupSearchParamsKey = 'name';

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
        break;
      case 'search':
        setParamValueInURL(groupSearchParamsKey, value);
        dataStore.filteredGroupsIds = getDiscordGroupIdsFromSearch(
          Object.values(dataStore.groups),
          value,
        );
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
    filteredGroupsIds: null,
    search: getParamValueFromURL(groupSearchParamsKey),
    discordId: null,
    isCreateGroupModalOpen: false,
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
};
const afterAuthentication = async () => {
  renderNavbarProfile({ profile: dataStore.userSelf });
  await Promise.all([getDiscordGroups(), getUserGroupRoles()]).then(
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
      dataStore.filteredGroupsIds = getDiscordGroupIdsFromSearch(
        Object.values(dataStore.groups),
        dataStore.search,
      );
      dataStore.discordId = roleData.userId;
    },
  );
};

// Bind Functions

const bindGroupCreationButton = () => {
  const groupCreationBtn = document.querySelector('.create-group');

  groupCreationBtn.addEventListener('click', () => {
    dataStore.isGroupCreationModalOpen = true;
  });
};

const bindSearchInput = () => {
  const searchInput = document.querySelector('.search__input');
  searchInput.value = dataStore.search;
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
