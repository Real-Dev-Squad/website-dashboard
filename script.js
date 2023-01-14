const userManagementLink = document.getElementById(USER_MANAGEMENT_LINK);

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

showSuperUserOptions(userManagementLink);
