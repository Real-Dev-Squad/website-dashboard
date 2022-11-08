export async function showUserManagementButton() {
  const isSuperUser = await checkUserIsSuperUser();
  if (isSuperUser) {
    userManagementLink.classList.remove('element-display-remove');
  }
}

showUserManagementButton();
