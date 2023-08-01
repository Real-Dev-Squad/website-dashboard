const userManagementLink = document.getElementById(USER_MANAGEMENT_LINK);
const extensionRequestsLink = document.getElementById(EXTENSION_REQUESTS_LINK);
const syncUsersStatusButton = document.getElementById(SYNC_USERS_STATUS);
const syncExternalAccountsButton = document.getElementById(
  SYNC_EXTERNAL_ACCOUNTS,
);
const syncUnverifiedUsersButton = document.getElementById(
  SYNC_UNVERIFIED_USERS,
);
const syncUsersStatusUpdate = document.getElementById(SYNC_USERS_STATUS_UPDATE);
const syncExternalAccountsUpdate = document.getElementById(
  SYNC_EXTERNAL_ACCOUNTS_UPDATE,
);
const syncUnverifiedUsersUpdate = document.getElementById(
  SYNC_UNVERIFIED_USERS_UPDATE,
);
const buttonSection = document.getElementById('sync-buttons');

function getCurrentTimestamp() {
  return new Date().toLocaleString();
}

export async function showSuperUserOptions(...privateBtns) {
  try {
    const isSuperUser = await checkUserIsSuperUser();
    if (isSuperUser) {
      privateBtns.forEach((btn) =>
        btn.classList.remove('element-display-remove'),
      );
      buttonSection.classList.remove('element-display-remove');
      syncUsersStatusUpdate.textContent = `Last Sync: ${
        localStorage.getItem('lastSyncUsersStatus') ||
        'Synced Data Not Available'
      }`;
      syncExternalAccountsUpdate.textContent = `Last Sync: ${
        localStorage.getItem('lastSyncExternalAccounts') ||
        'Synced Data Not Available'
      }`;
      syncUnverifiedUsersUpdate.textContent = `Last Sync: ${
        localStorage.getItem('lastSyncUnverifiedUsers') ||
        'Synced Data Not Available'
      }`;
    }
  } catch (err) {
    console.log(err);
  }
}

/*
 * To show the super user options only to the super user, give all those
 * buttons or node the class "element-display-remove" so by default they are hidden.
 * Then get the node from the DOM into a variable and pass that variable in the
 * function below.
 */
showSuperUserOptions(userManagementLink, extensionRequestsLink);

const createGoalButton = document.getElementById('create-goal');
const params = new URLSearchParams(window.location.search);
if (params.get('dev') === 'true') {
  createGoalButton.classList.remove('element-display-remove');
}

function addClickEventListener(
  button,
  endpoint,
  localStorageKey,
  lastSyncElement,
  method,
) {
  button.addEventListener('click', async (event) => {
    await handleSync(endpoint, localStorageKey, lastSyncElement, method, event);
  });
}

async function handleSync(
  endpoint,
  localStorageKey,
  lastSyncElement,
  method,
  event,
) {
  const button = event.target;
  const wrapper = button.parentElement;
  const spinner = wrapper.querySelector('.spinner');
  const status = wrapper.querySelector('.status');
  
  button.disabled = true;
  button.classList.add(DISABLED);
  spinner.style.display = 'inline-block';
  status.textContent = SYNC_IN_PROGRESS;

  if(button.id === "sync-users-status") {
    try {
      const userStatus = fetch(`${API_BASE_URL}${endpoint.userStatusUpdate}`, {
        method: method.userStatusMethod,
        credentials: 'include',
      });
      
      const idleUsers = fetch(`${API_BASE_URL}${endpoint.idle}`, {
        method: method.idleMethod,
        credentials: 'include',
      })
      .then((res) => res.json())
      .then((data) => data.data.users)

      const [ userStatusResponse, idleUsersData ] = await Promise.all([ userStatus, idleUsers ]);

      const batchResponse = await fetch(`${API_BASE_URL}${endpoint.batchIdle}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        method: method.batchIdleMethod,
        body: JSON.stringify({ users: idleUsersData }),
        credentials: 'include'
      })

      if (userStatusResponse.ok && batchResponse.ok) {
        status.textContent = SYNC_SUCCESSFUL;
        const lastSyncTimestamp = getCurrentTimestamp();
  
        localStorage.setItem(localStorageKey, lastSyncTimestamp);
  
        if (lastSyncElement) {
          lastSyncElement.textContent = `Last Sync: ${lastSyncTimestamp}`;
        }
      } else {
        status.textContent = SYNC_FAILED;
      }
    } catch (err) {
      console.error(err);
      status.textContent = SYNC_FAILED;
    } finally {
      spinner.style.display = 'none';
      button.classList.remove(DISABLED);
      button.disabled = false;
    }

  } else {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: method,
        credentials: 'include',
      });
  
      if (response.ok) {
        status.textContent = SYNC_SUCCESSFUL;
        const lastSyncTimestamp = getCurrentTimestamp();
  
        localStorage.setItem(localStorageKey, lastSyncTimestamp);
  
        if (lastSyncElement) {
          lastSyncElement.textContent = `Last Sync: ${lastSyncTimestamp}`;
        }
      } else {
        status.textContent = SYNC_FAILED;
      }
    } catch (err) {
      console.error(err);
      status.textContent = SYNC_FAILED;
    } finally {
      spinner.style.display = 'none';
      button.classList.remove(DISABLED);
      button.disabled = false;
    }
  }
}

// Attach (button,API,cookie name,div element of status,HTTP method of API
addClickEventListener(
  syncUsersStatusButton,
  {
    idle: '/users/status?aggregate=true',
    batchIdle: '/users/status/batch',
    userStatusUpdate: '/users/status/update'
  },
  'lastSyncUsersStatus',
  syncUsersStatusUpdate,
  {
    idleMethod: 'GET',
    batchIdleMethod: 'PATCH',
    userStatusMethod: 'PATCH'
  },
);
addClickEventListener(
  syncExternalAccountsButton,
  '/external-accounts/discord-sync',
  'lastSyncExternalAccounts',
  syncExternalAccountsUpdate,
  'PATCH',
);
addClickEventListener(
  syncUnverifiedUsersButton,
  '/users/',
  'lastSyncUnverifiedUsers',
  syncUnverifiedUsersUpdate,
  'POST',
);
