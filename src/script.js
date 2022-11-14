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

showUserManagementButton();
