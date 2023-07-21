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

export async function showSuperUserOptions(...privateBtns) {
  try {
    const isSuperUser = await checkUserIsSuperUser();
    if (isSuperUser) {
      privateBtns.forEach((btn) =>
        btn.classList.remove('element-display-remove'),
      );
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
showSuperUserOptions(
  userManagementLink,
  extensionRequestsLink,
  syncUsersStatusButton,
  syncExternalAccountsButton,
  syncUsersStatusUpdate,
  syncExternalAccountsUpdate,
  syncUnverifiedUsersButton,
  syncUnverifiedUsersUpdate,
);

const createGoalButton = document.getElementById('create-goal');
const params = new URLSearchParams(window.location.search);
if (params.get('dev') === 'true') {
  createGoalButton.classList.remove('element-display-remove');
}

syncUsersStatusButton.addEventListener('click', syncUsersStatus);
syncExternalAccountsButton.addEventListener('click', syncExternalAccounts);
syncUnverifiedUsersButton.addEventListener('click', syncUnverifiedUsers);

async function syncUsersStatus(event) {
  const button = event.target;
  const wrapper = button.parentElement;
  const spinner = wrapper.querySelector('.spinner');
  const status = wrapper.querySelector('.status');

  button.disabled = true;
  button.classList.add(DISABLED);
  spinner.style.display = 'inline-block';
  status.textContent = SYNC_IN_PROGRESS;

  try {
    const response = await fetch(`${API_BASE_URL}/users/status/update`, {
      method: 'PATCH',
      credentials: 'include',
    });
    status.textContent = response.ok ? SYNC_SUCCESSFUL : SYNC_FAILED;
  } catch (err) {
    console.error(err);
    status.textContent = SYNC_FAILED;
  } finally {
    spinner.style.display = 'none';
    button.classList.remove(DISABLED);
    button.disabled = false;
  }
}

//for external accounts
async function syncExternalAccounts(event) {
  const button = event.target;
  const wrapper = button.parentElement;
  const spinner = wrapper.querySelector('.spinner');
  const status = wrapper.querySelector('.status');

  button.disabled = true;
  button.classList.add(DISABLED);
  spinner.style.display = 'inline-block';
  status.textContent = SYNC_IN_PROGRESS;

  try {
    const response = await fetch(
      `${API_BASE_URL}/external-accounts/discord-sync`,
      {
        method: 'PATCH',
        credentials: 'include',
      },
    );
    status.textContent = response.ok ? SYNC_SUCCESSFUL : SYNC_FAILED;
  } catch (err) {
    console.error(err);
    status.textContent = SYNC_FAILED;
  } finally {
    spinner.style.display = 'none';
    button.classList.remove(DISABLED);
    button.disabled = false;
  }
}

async function syncUnverifiedUsers(event) {
  const button = event.target;
  const wrapper = button.parentElement;
  const spinner = wrapper.querySelector('.spinner');
  const status = wrapper.querySelector('.status');

  button.disabled = true;
  button.classList.add(DISABLED);
  spinner.style.display = 'inline-block';
  status.textContent = SYNC_IN_PROGRESS;

  try {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      credentials: 'include',
    });
    status.textContent = response.ok ? SYNC_SUCCESSFUL : SYNC_FAILED;
  } catch (err) {
    console.error(err);
    status.textContent = SYNC_FAILED;
  } finally {
    spinner.style.display = 'none';
    button.classList.remove(DISABLED);
    button.disabled = false;
  }
}

//showUserManagementButton();
