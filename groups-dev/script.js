'use strict';
import { createCard, createLoadingCard } from './render.js';
import {
  addGroupRoleToMember,
  getDiscordGroups,
  getUserGroupRoles,
  getUserSelf,
  removeRoleFromMember,
} from './utils.js';

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
        diffGroups.forEach((group) => renderGroupById(group.id));
        break;
      case 'filteredGroupsIds':
        const oldFilteredGroupsIds = obj.filteredGroupsIds;
        obj[prop] = value;

        if (oldFilteredGroupsIds == null) break;
        // Optimization possible: Only rerender groups that have been added/removed
        renderAllGroups();
        break;
      case 'search':
        if (value === '') {
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
    search: '',
    discordId: null,
  },
  handler,
);

// Lifecycle functions

const onCreate = () => {
  renderLoadingCards();
  getUserSelf()
    .then((data) => (dataStore.userSelf = data))
    .then(afterAuthentication);

  bindSearchInput();
  bindSearchFocus();
};

const afterAuthentication = async () => {
  Promise.all([getDiscordGroups(), getUserGroupRoles()])
    .then(([groups, roleData]) => {
      dataStore.filteredGroupsIds = groups.map((group) => group.id);
      dataStore.groups = groups.reduce((acc, group) => {
        acc[group.id] = {
          id: group.id,
          title: group.rolename,
          count: group.memberCount,
          isMember: group.isMember,
          roleId: group.roleid,
          description: group.description,
          isUpdating: false,
        };
        return acc;
      }, {});
      dataStore.discordId = roleData.userId;
    })
    .then(() => removeLoadingCards());
};

// Bind Functions

const bindSearchInput = () => {
  const searchInput = document.querySelector('.search__input');
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

// Render functions

const renderLoadingCards = () => {
  const mainContainer = document.querySelector('.group-container');
  const cardCount = 6;
  for (let i = 0; i < cardCount; i++) {
    const card = createLoadingCard();
    mainContainer.append(card);
  }
};

const removeLoadingCards = () => {
  const mainContainer = document.querySelector('.group-container');
  const loadingCards = mainContainer.querySelectorAll('.card--loading');
  loadingCards.forEach((card) => mainContainer.removeChild(card));
};

const renderGroupById = (id) => {
  const group = dataStore.groups[id];
  const card = createCard(group, cardOnClick);

  function updateGroup(id, group) {
    dataStore.groups = {
      ...dataStore.groups,
      [id]: {
        ...dataStore.groups[id],
        ...group,
      },
    };
  }

  function cardOnClick() {
    updateGroup(id, { isUpdating: true });
    if (group.isMember) {
      removeRoleFromMember(group.roleId, dataStore.discordId)
        .then(() =>
          updateGroup(id, { isMember: false, count: group.count - 1 }),
        )
        .finally(() => updateGroup(id, { isUpdating: false }));
    } else {
      addGroupRoleToMember({
        roleid: group.roleId,
        userid: dataStore.discordId,
      })
        .then(() => updateGroup(id, { isMember: true, count: group.count + 1 }))
        .finally(() => updateGroup(id, { isUpdating: false }));
    }
  }

  const mainContainer = document.querySelector('.group-container');
  const groupElement = document.getElementById(`group-${id}`);
  if (groupElement) {
    mainContainer.replaceChild(card, groupElement);
  } else {
    mainContainer.append(card);
  }
};

function renderAllGroups() {
  const mainContainer = document.querySelector('.group-container');
  mainContainer.innerHTML = '';
  dataStore.filteredGroupsIds.forEach((id) => renderGroupById(id));
}

onCreate();
