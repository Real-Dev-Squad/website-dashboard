const userManagementLink = document.getElementById(USER_MANAGEMENT_LINK);
export async function showUserManagementButton() {
  try {
    const isSuperUser = await checkUserIsSuperUser();
    if (isSuperUser) {
      userManagementLink.classList.remove('element-display-remove');
    }
  } catch (err) {
    console.log(err);
  }
}

const createGoalButton = document.getElementById('create-goal');
const params = new URLSearchParams(window.location.search);
if (params.get('dev') === 'true') {
  createGoalButton.classList.remove('element-display-remove');
}

showUserManagementButton();
