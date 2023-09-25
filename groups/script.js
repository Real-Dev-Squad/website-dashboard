'use strict';
import {
  CANNOT_CONTAIN_GROUP,
  DEV_FEATURE_FLAG,
  NO_SPACES_ALLOWED,
} from './constants.js';
import {
  removeGroupKeywordFromDiscordRoleName,
  getDiscordGroups,
  addGroupRoleToMember,
  createDiscordGroupRole,
  getUserSelf,
  getUserGroupRoles,
  getSearchValueFromURL,
} from './utils.js';
const groupTabs = document.querySelector('.groups-tab');
const tabs = document.querySelectorAll('.groups-tab div');
const sections = document.querySelectorAll('.manage-groups, .create-group');
const loader = document.querySelector('.backdrop');
const userIsNotVerifiedText = document.querySelector('.not-verified-tag');
const params = new URLSearchParams(window.location.search);
const searchValue = getSearchValueFromURL();
const isDev = params.get(DEV_FEATURE_FLAG) === 'true';
// const paragraphElement = null, paragraphContent = '';

const searchInput = document.getElementById('search-groups');
//Let searchInput has searchValue as it is independent to API calls mentioned below
if (searchValue) {
  searchInput.value = searchValue;
}
//User Data
const userSelfData = await getUserSelf();
let UserGroupData = await getUserGroupRoles();

/**
 * Create DOM for "created by author" line under groupName
 *
 */
const createAuthorDetailsDOM = (firstName, lastName, imageUrl) => {
  const container = document.createElement('div');
  container.classList.add('created-by--container');

  if (imageUrl) {
    const userAvatar = document.createElement('img');
    userAvatar.classList.add('created-by--avatar');
    userAvatar.src = imageUrl;
    userAvatar.setAttribute('alt', "group's creator image");
    container.appendChild(userAvatar);
  }

  if (firstName || lastName) {
    const createdBy = document.createElement('span');
    createdBy.classList.add('created-by');
    createdBy.textContent = `created by ${firstName ?? ''} ${lastName ?? ''}`;
    container.appendChild(createdBy);
  }

  return container;
};

/**
 * GET SELF DATA
 */
const IsUserVerified = !!userSelfData.discordId;
const IsUserArchived = userSelfData.roles.archived;
if (!IsUserVerified || IsUserArchived) {
  userIsNotVerifiedText.classList.remove('hidden');
}
const memberAddRoleBody = {
  userid: userSelfData?.discordId,
  roleid: '',
};

/**
 *
 * FOR RENDERING GROUP ROLES IN 'MANAGE ROLES' TAB
 */
const groupsData = await getDiscordGroups(isDev);
const groupRoles = document.querySelector('.groups-list');
groupsData?.forEach((item) => {
  const group = document.createElement('li');
  group.setAttribute('id', item.roleid);
  group.classList.add('group-role');
  const formattedRoleName = removeGroupKeywordFromDiscordRoleName(
    item.rolename,
  );

  //If searchValue present, filter out the list
  if (searchValue) {
    group.style.display = formattedRoleName
      .toUpperCase()
      .includes(searchValue.toUpperCase())
      ? ''
      : 'none';
  }

  const groupname = document.createElement('p');
  groupname.classList.add('group-name');
  groupname.setAttribute('id', `name-${item.roleid}`);

  if (item.memberCount !== null && item.memberCount !== undefined) {
    groupname.setAttribute('data-member-count', item.memberCount);
  }

  groupname.textContent = formattedRoleName;

  const createdBy = createAuthorDetailsDOM(
    item.firstName,
    item.lastName,
    item.image,
  );

  group.appendChild(groupname);
  group.appendChild(createdBy);
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
function isRoleIdInData(data, targetRoleId) {
  // Use the some() method to check if any element in data.groups has a matching roleId
  return data.groups.some((group) => group.roleId === targetRoleId);
}

/**
 * FOR SELECTING A GROUP
 */
const pathname = window.location.pathname;
const groupRolesList = document.querySelectorAll('.group-role');
groupRoles?.addEventListener('click', function (event) {
  groupRolesList.forEach((groupItem) => {
    groupItem.classList?.remove('active-group');
  });
  const groupListItem = event.target?.closest('li');
  if (groupListItem) {
    groupListItem.classList.add('active-group');
    memberAddRoleBody.roleid = groupListItem.id;
    if (IsUserVerified) {
      if (isDev) {
        buttonAddRole.removeEventListener('click', addrole);
        updateButtonState();
      } else {
        buttonAddRole.disabled = false;
        buttonAddRole.addEventListener('click', addrole);
      }
    }
  }
});
// Function to update the button state based on user's group roles
function updateButtonState() {
  const isRoleIdPresent = isRoleIdInData(
    UserGroupData,
    memberAddRoleBody.roleid,
  );
  buttonAddRole.textContent = isRoleIdPresent
    ? 'Remove me from this group'
    : 'Add me to this group';
  buttonAddRole.disabled = false;

  isRoleIdPresent
    ? (buttonAddRole.removeEventListener('click', addrole),
      buttonAddRole.addEventListener('click', removeRoleHandler))
    : (buttonAddRole.removeEventListener('click', removeRoleHandler),
      buttonAddRole.addEventListener('click', addrole));
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

searchInput.addEventListener(
  'input',
  debounce(() => {
    loader.classList.remove('hidden');
    searchInput.disabled = true; //Disable user input when loader is active
    const devFeatureFlag = isDev ? '&dev=true' : '';
    const newURL = `${window.location.pathname}?${searchInput.value}${devFeatureFlag}`;
    window.history.pushState({}, '', newURL);
    const searchValue = searchInput.value.toUpperCase();
    const groupRoles = document.querySelectorAll('.group-role');
    let foundResults = false;
    groupRoles.forEach((groupRole) => {
      const paragraphElement = groupRole.getElementsByTagName('p')[0];
      const paragraphContent = paragraphElement.textContent;
      const displayValue =
        paragraphContent.toUpperCase().indexOf(searchValue) > -1 ? '' : 'none';
      groupRole.style.display = displayValue;

      if (displayValue === '') {
        foundResults = true;
      }
      loader.classList.add('hidden');
    });
    const noResultsMessage = document.getElementById('no-results-message');
    noResultsMessage.style.display = foundResults ? 'none' : 'block';
    loader.classList.add('hidden');
    searchInput.disabled = false;
  }, 500), //Reduced debounce for improved user experience
);

/**
 * TO ASSIGN YOURSELF A ROLE
 */
const buttonAddRole = document.querySelector('.btn-add-role');
async function addrole() {
  if (memberAddRoleBody?.userid && memberAddRoleBody?.roleid !== '') {
    loader.classList.remove('hidden');

    try {
      // Add the role to the member
      const res = await addGroupRoleToMember(memberAddRoleBody);

      const groupNameElement = document.getElementById(
        `name-${memberAddRoleBody.roleid}`,
      );
      const currentCount = groupNameElement.getAttribute('data-member-count');
      if (currentCount !== null && currentCount !== undefined) {
        groupNameElement.setAttribute('data-member-count', +currentCount + 1);
      }
      alert(res.message);
      if (isDev) {
        // After adding the role, re-fetch the user group data to update it
        UserGroupData = await getUserGroupRoles();

        // Update the button state with the refreshed data
        updateButtonState();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      loader.classList.add('hidden');
    }
  }
}

/**
 * TO REMOVE YOURSELF OF A ROLE
 */
async function removeRoleHandler() {
  console.log('Remove function to be added after this pr');

  // TODO: REMOVE ME BUTTON FUNCTIONALITY TO BE ADDED
}

/**
 *
 * Create group roles section
 */
const createGroupButton = document.querySelector('.btn-create-group');
const inputNewGroupRole = document.querySelector('.new-group-input');

if (!IsUserVerified) {
  createGroupButton.disabled = true;
}

/**
 *
 * Check if group role is valid
 */

const isValidGroupRole = (rolename) => {
  const error = {
    valid: true,
    message: '',
  };
  if (rolename.includes('group')) {
    error.valid = false;
    error.message = CANNOT_CONTAIN_GROUP;
  }
  if (rolename.split(' ').length > 1) {
    error.valid = false;
    error.message = NO_SPACES_ALLOWED;
  }
  return error;
};

/**
 * CREATING A NEW GROUP ROLE
 */
createGroupButton.addEventListener('click', async () => {
  const inputValue = inputNewGroupRole?.value.trim();
  if (inputValue === '') return;

  const isValidRole = isValidGroupRole(inputValue);
  if (!isValidRole.valid) {
    alert(isValidRole.message);
    return;
  }

  loader?.classList?.remove('hidden');

  const groupRoleBody = { rolename: inputValue };
  createDiscordGroupRole(groupRoleBody)
    .then((res) => alert(res.message))
    .catch((err) => alert(err.message))
    .finally(() => {
      inputNewGroupRole.value = '';
      loader.classList.add('hidden');
      location.reload();
    });
});
