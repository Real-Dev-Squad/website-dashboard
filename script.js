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
const repoSyncStatusUpdate = document.getElementById(SYNC_REPO_STATUS_UPDATE);

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
    const isSuperUser = true;//await checkUserIsSuperUser();
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
      repoSyncStatusUpdate.textContent = `Last Sync: ${
        localStorage.getItem('lastSyncRepo') ||
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
const repoSyncDiv = document.getElementById('sync-repo-div');
const repoSyncButton = document.getElementById('repo-sync-button');
const toast = document.getElementById('toast');
const params = new URLSearchParams(window.location.search);
if (params.get('dev') === 'true') {
  createGoalButton.classList.remove('element-display-remove');
  repoSyncDiv.classList.remove('element-display-remove');
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


function showToast(message, type) {
  if(typeof message === String){
    toast.innerHTML = `<div class="message">${message}</div>`;
  }
  toast.classList.remove('hidden');

  
  if (type === 'success') {
    for(let i=0;i<message.merge_status.length;i++){
      if(message.merge_status[i].status.updated){
        let repo = message.merge_status[i].repository;
        let text=repo.substring(repo.lastIndexOf('/')+1)+" synced";
        toast.innerHTML = `<div class="message">${text}</div>`;
      }
    }
      toast.classList.add('success');
      toast.classList.remove('failure');
  } else if (type === 'failure') {
      toast.classList.add('failure');
      toast.classList.remove('success');
  }

  const progressBar = document.createElement('div');
  progressBar.classList.add('progress-bar');
  progressBar.classList.add('fill');
  toast.appendChild(progressBar);

  setTimeout(() => {
      toast.classList.add('hidden');
      toast.innerHTML = ''; // Clear any appended elements (progress bar)
  }, 5000);
 
}

const repoSyncHandler = async () => {
  try{
    const response = await fetch(REPO_SYNC_API_URL,
      { mode: 'no-cors' });
    console.log(response);
    if (response.ok) {
      repoSyncStatusUpdate.textContent = SYNC_SUCCESSFUL;
      showToast(response.body, 'success');
    } else {
      console.log("hi");
      repoSyncStatusUpdate.textContent = SYNC_FAILED;
      showToast('API response not as expected', 'failure');
    }
  }catch(err){
    console.log("error");
    console.error("Error while fetching repo sync data");
    repoSyncStatusUpdate.textContent = SYNC_FAILED;
    showToast('Something unexpected happened!', 'failure');
  }
}

repoSyncButton.addEventListener('click', repoSyncHandler);


// Attach (button,API,cookie name,div element of status,HTTP method of API
addClickEventListener(
  syncUsersStatusButton,
  '/users/status/update',
  'lastSyncUsersStatus',
  syncUsersStatusUpdate,
  'PATCH',
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
