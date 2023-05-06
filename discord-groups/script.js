'use strict';
import {
  getMembers,
  getDiscordGroups,
  addGroupRoleToMember,
  createDiscordGroupRole,
  getUserSelf,
} from './utils.js';
const groupTabs = document.querySelector('.groups-tab');
const tabs = document.querySelectorAll('.groups-tab div');
const sections = document.querySelectorAll('.manage-groups, .create-group');
const loader = document.querySelector('.loader');
const userIsNotVerifiedText = document.querySelector('.not-verified-tag');

const membersIdNameObject = {};
const membersData = await getMembers();

// CREATED A MAP OF {id:username}
membersData.forEach((member) => {
  if (member.username) membersIdNameObject[member.id] = member.username;
});

/**
 * GET SELF DATA
 */
const userSelfData = await getUserSelf();
const userIsVerified = !!userSelfData.discordId;
!userIsVerified && userIsNotVerifiedText.classList.remove('hidden');
const memberAddRoleBody = {
  userid: userSelfData?.discordId,
  roleid: '',
};

/**
 *
 * FOR RENDERING GROUP ROLES IN 'MANAGE ROLES' TAB
 */
const groupsData = await getDiscordGroups();
const groupRoles = document.querySelector('.groups-list');
groupsData?.forEach((item) => {
  const group = document.createElement('li');
  const groupname = document.createElement('p');
  groupname.classList.add('group-name');
  const createdBy = document.createElement('span');
  createdBy.classList.add('create-by');
  groupname.textContent = item.rolename;
  createdBy.textContent = 'created by ' + membersIdNameObject[item.createdBy];
  group.appendChild(groupname);
  group.appendChild(createdBy);
  group.setAttribute('id', item.roleid);
  group.classList.add('group-role');
  groupRoles.appendChild(group);
});

/**
 * FOR RENDERING TABS
 * I.E. MANAGE ROLES, CREATE GROUP
 */
tabs?.forEach((tab, index) => {
  tab.addEventListener('click', (e) => {
    sections.forEach((section) => {
      section.classList.add('hidden');
    });
    sections[index].classList.remove('hidden');
  });
});

/**
 * FOR CHANGING TABS
 */
groupTabs.addEventListener('click', (e) => {
  tabs.forEach((tab) => {
    tab.classList?.remove('active-tab');
  });
  if (e.target.nodeName !== 'NAV') e.target?.classList?.add('active-tab');
});

/**
 * FOR SELECTING A GROUP
 */
const groupRolesList = document.querySelectorAll('.group-role');
groupRoles?.addEventListener('click', function (event) {
  groupRolesList.forEach((groupItem) => {
    groupItem.classList?.remove('active-group');
  });
  const groupListItem = event.target?.closest('li');
  if (groupListItem) {
    groupListItem.classList.add('active-group');
    memberAddRoleBody.roleid = groupListItem.id;
    userIsVerified && (buttonAddRole.disabled = false);
  }
});

/**
 * TO ASSIGN YOURSELF A ROLE
 */
const buttonAddRole = document.querySelector('.btn-add-role');
buttonAddRole.addEventListener('click', async function () {
  if (memberAddRoleBody?.userid && memberAddRoleBody?.roleid !== '') {
    loader.classList.remove('hidden');

    await addGroupRoleToMember(memberAddRoleBody)
      .then((res) => alert(res.message))
      .catch((err) => alert(err.message))
      .finally(() => loader.classList.add('hidden'));
  }
});

/**
 *
 * Create group roles section
 */
const createGroupButton = document.querySelector('.btn-create-group');
const inputField = document.querySelector('.new-group-input');

!userIsVerified && (createGroupButton?.disabled = true);

/**
 * CREATING A NEW GROUP ROLE
 */
createGroupButton.addEventListener('click', async () => {
  const inputValue = inputField?.value.trim();
  if (inputValue === '') return;

  if (inputValue.includes('group')) {
    alert("Roles cannot contain 'group'.");
    return;
  }
  loader?.classList?.remove('hidden');

  const groupRoleBody = { rolename: inputValue };
  await createDiscordGroupRole(groupRoleBody)
    .then((res) => alert(res.message))
    .catch((err) => alert(err.message))
    .finally(() => {
      inputField.value = '';
      loader.classList.add('hidden');
      location.reload();
    });
});
