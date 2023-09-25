const BASE_URL = 'https://api.realdevsquad.com'; // REPLACE WITH YOUR LOCALHOST URL FOR TESTING LOCAL BACKEND

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
    const res = await fetch(`${BASE_URL}/users/self`, {
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

async function getDiscordGroups(isDev) {
  try {
    const devFeatureFlag = isDev ? '?dev=true' : '';
    const res = await fetch(
      `${BASE_URL}/discord-actions/groups${devFeatureFlag}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-type': 'application/json',
        },
      },
    );

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

function removeGroupKeywordFromDiscordRoleName(groupName) {
  if (/^group.*/.test(groupName)) {
    const splitNames = groupName.split('-');
    splitNames.shift();
    return splitNames.join('-');
  }
  return groupName;
}

//Function to parse only search value from URL
function getSearchValueFromURL() {
  const params = new URLSearchParams(window.location.search);

  let searchValue = null;

  for (const [key, value] of params.entries()) {
    if (value === '') {
      searchValue = key;
      break;
    }
  }
  return searchValue;
}
export {
  getUserGroupRoles,
  getMembers,
  getUserSelf,
  getDiscordGroups,
  createDiscordGroupRole,
  addGroupRoleToMember,
  removeGroupKeywordFromDiscordRoleName,
  getSearchValueFromURL,
};
