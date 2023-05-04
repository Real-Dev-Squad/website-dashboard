async function getMembers() {
  const res = await fetch(`http://localhost:3000/members/`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });

  const { members } = await res.json();
  return members;
}
async function getDiscordGroups() {
  const res = await fetch(`http://localhost:3000/discord-actions/groups`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });

  const { groups } = await res.json();
  return groups;
}
async function createDiscordGroupRole(groupRoleBody) {
  const res = await fetch(`http://localhost:3000/discord-actions/groups`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(groupRoleBody),
  });

  const self_user = await res.json();
  return self_user;
}

async function addGroupRoleToMember(memberRoleBody) {
  const res = await fetch(`http://localhost:3000/discord-actions/roles`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(memberRoleBody),
  });

  const self_user = await res.json();
  return self_user;
}

export {
  getMembers,
  getDiscordGroups,
  createDiscordGroupRole,
  addGroupRoleToMember,
};
