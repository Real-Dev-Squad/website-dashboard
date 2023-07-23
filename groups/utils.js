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

    const data = await res.json();
    return data;
  } catch (err) {
    return err;
  }
}

export {
  getMembers,
  getUserSelf,
  getDiscordGroups,
  createDiscordGroupRole,
  addGroupRoleToMember,
};
