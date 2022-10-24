async function showUserManagementButton() {
  const isSuperUser = await checkUserIsSuperUser();
  if (isSuperUser) {
    userManagementBtn.classList.remove('element-display-remove');
  }
}

showUserManagementButton();
