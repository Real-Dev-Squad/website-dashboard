const userManagementLink = document.getElementById(USER_MANAGEMENT_LINK);
const extensionRequestsLink = document.getElementById(EXTENSION_REQUESTS_LINK);
const syncDiscordUserDataButton = document.getElementById(
  SYNC_DISCORD_USER_DATA,
);
const syncUnverifiedUserDataButton = document.getElementById(
  SYNC_UNVERIFIED_USER_DATA,
);
const syncDiscordUserDataStatus = document.getElementById(
  SYNC_DISCORD_USER_DATA_STATUS,
);
const syncUnverifiedDiscordStatus = document.getElementById(
  SYNC_UNVERIFIED_USER_DATA_STATUS,
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
  syncDiscordUserDataButton,
  syncUnverifiedUserDataButton,
  syncDiscordUserDataStatus,
  syncUnverifiedDiscordStatus,
);

const createGoalButton = document.getElementById('create-goal');
const params = new URLSearchParams(window.location.search);
if (params.get('dev') === 'true') {
  createGoalButton.classList.remove('element-display-remove');
}

syncDiscordUserDataButton.addEventListener('click', syncDiscordUserData);
syncUnverifiedUserDataButton.addEventListener('click', syncUnverifiedUserData);

async function syncDiscordUserData(event) {
  const button = event.target;
  const wrapper = button.parentElement;
  const spinner = wrapper.querySelector('.spinner');
  const status = wrapper.querySelector('.status');

  button.disabled = true;
  button.classList.add('disabled');
  spinner.style.display = 'inline-block';
  status.textContent = 'Last Sync: In progress';

  try {
    const response = await fetch(`${API_BASE_URL}/users/status/update`, {
      method: 'PATCH',
      credentials: 'include',
    });

    // Check if the response is ok
    if (response.ok) {
      status.textContent = 'Last Sync: Successful';
    } else {
      status.textContent = 'Last Sync: Failed';
    }
  } catch (err) {
    console.error(err);
    status.textContent = 'Last Sync: Failed';
  } finally {
    spinner.style.display = 'none';
    button.classList.remove('disabled');
    button.disabled = false;
  }
}

//for external accounts
async function syncUnverifiedUserData(event) {
  const button = event.target;
  const wrapper = button.parentElement;
  const spinner = wrapper.querySelector('.spinner');
  const status = wrapper.querySelector('.status');

  button.disabled = true;
  button.classList.add('disabled');
  spinner.style.display = 'inline-block';
  status.textContent = 'Last Sync: In progress';

  try {
    const response = await fetch(
      `${API_BASE_URL}/external-accounts/discord-sync`,
      {
        method: 'PATCH',
        credentials: 'include',
      },
    );
    // Check if the response is ok
    if (response.ok) {
      status.textContent = 'Last Sync: Successful';
    } else {
      status.textContent = 'Last Sync: Failed';
    }
  } catch (err) {
    console.error(err);
    status.textContent = 'Last Sync: Failed';
  } finally {
    spinner.style.display = 'none';
    button.classList.remove('disabled');
    button.disabled = false;
  }
}

showUserManagementButton();
