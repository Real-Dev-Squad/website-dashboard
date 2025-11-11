const BASE_URL = window.API_BASE_URL; // REPLACE WITH YOUR LOCALHOST URL FOR TESTING LOCAL BACKEND
async function getMembers() {
  try {
    const res = await fetch(`${BASE_URL}/users/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    const { users } = await res.json();
    return users;
  } catch (err) {
    return err;
  }
}
async function getUserSelf() {
  try {
    const res = await fetch(`${BASE_URL}/users?profile=true`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    const user_self = await res.json();
    return user_self;
  } catch (err) {
    return err;
  }
}
async function getUserGroupRoles() {
  const res = await fetch(`${BASE_URL}/discord-actions/roles`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });
  return await res.json();
}

async function getDiscordGroups() {
  try {
    const res = await fetch(`${BASE_URL}/discord-actions/groups`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    const { groups } = await res.json();
    return groups;
  } catch (err) {
    return err;
  }
}
async function createDiscordGroupRole(groupRoleBody) {
  try {
    const res = await fetch(`${BASE_URL}/discord-actions/groups`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(groupRoleBody),
    });

    const self_user = await res.json();
    return self_user;
  } catch (err) {
    return err;
  }
}

async function addGroupRoleToMember(memberRoleBody) {
  try {
    const res = await fetch(`${BASE_URL}/discord-actions/roles`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(memberRoleBody),
    });

    if (!res.ok) {
      const error = await res.json();
      throw error;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}

async function removeRoleFromMember(roleId, discordId) {
  try {
    const res = await fetch(`${BASE_URL}/discord-actions/roles`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ roleid: roleId, userid: discordId }),
    });

    return await res.json();
  } catch (err) {
    throw err;
  }
}

async function deleteDiscordGroupRole(groupId) {
  try {
    const res = await fetch(`${BASE_URL}/discord-actions/groups/${groupId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      throw new Error(
        `Failed to delete group role: ${JSON.stringify(errorResponse.error)}`,
      );
    }

    return await res.json();
  } catch (err) {
    throw err;
  }
}

function removeGroupKeywordFromDiscordRoleName(groupName) {
  if (/^group.*/.test(groupName)) {
    const splitNames = groupName.split('-');
    splitNames.shift();
    return splitNames.join('-');
  }
  return groupName;
}

function getDiscordGroupIdsFromSearch(groups, multipleGroupSearch) {
  if (!multipleGroupSearch) return groups.map((group) => group.id);
  const GROUP_SEARCH_SEPARATOR = ',';
  const searchGroups = multipleGroupSearch
    .split(GROUP_SEARCH_SEPARATOR)
    .map((group) => group.trim().toLowerCase());
  const matchGroups = groups.filter((group) =>
    searchGroups.some((searchGroup) =>
      group.title.toLowerCase().startsWith(searchGroup),
    ),
  );
  return matchGroups.map((group) => group.id);
}

function getParamValueFromURL(paramKey) {
  const params = new URLSearchParams(window.location.search);
  return params.get(paramKey);
}

function setParamValueInURL(paramKey, paramValue) {
  const params = new URLSearchParams(window.location.search);
  if (paramValue === '') params.delete(paramKey);
  else params.set(paramKey, paramValue);
  window.history.replaceState(
    {},
    '',
    window.location.pathname + (params.toString() && `?${params}`),
  );
}

const fullDateString = (timestamp) => {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    return 'N/A';
  }
  const dateObj = new Date(timestamp);
  if (isNaN(dateObj.getTime())) {
    return 'N/A';
  }
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    hour12: true,
  };
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

const shortDateString = (timestamp) => {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    return 'N/A';
  }
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return 'N/A';
  }
  const year = date.getFullYear();
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
    date,
  );
  return `${date.getDate()} ${month} ${year}`;
};

export {
  getUserGroupRoles,
  getMembers,
  getUserSelf,
  getDiscordGroups,
  createDiscordGroupRole,
  addGroupRoleToMember,
  removeRoleFromMember,
  deleteDiscordGroupRole,
  removeGroupKeywordFromDiscordRoleName,
  getDiscordGroupIdsFromSearch,
  getParamValueFromURL,
  setParamValueInURL,
  fullDateString,
  shortDateString,
};
