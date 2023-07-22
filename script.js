const userManagementLink = document.getElementById(USER_MANAGEMENT_LINK);
const extensionRequestsLink = document.getElementById(EXTENSION_REQUESTS_LINK);
const overdueTasksLink = document.getElementById(OVERDUE_TASKS_LINK);

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
  overdueTasksLink,
);

const createGoalButton = document.getElementById('create-goal');
const params = new URLSearchParams(window.location.search);
if (params.get('dev') === 'true') {
  createGoalButton.classList.remove('element-display-remove');
}

// showUserManagementButton();
