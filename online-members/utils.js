async function makeApiCall(
  url,
  method = 'get',
  body = null,
  headers = [],
  options = null,
) {
  try {
    const response = await fetch(url, {
      method,
      body,
      headers,
      ...options,
    });
    return response;
  } catch (err) {
    console.error(MESSAGE_SOMETHING_WENT_WRONG, err);
    throw err;
  }
}

async function getUsersData() {
  let usersList = null;
  const userObject = {};
  const usersRequest = await makeApiCall(RDS_API_USERS);
  if (usersRequest.status === 200) {
    usersList = await usersRequest.json();
    usersList = usersList.users;
    usersList = usersList.filter((user) => !user.incompleteUserDetails);
    usersList.forEach((user) => {
      userObject[`${user.username}`] = {
        isOnline: false,
        ...user,
      };
    });
  }
  return userObject;
}

async function getUserTaskData(username) {
  let taskData = null;
  const usersRequest = await makeApiCall(rdsApiTaskDetails(username));
  if (usersRequest.status === 200) {
    taskData = await usersRequest.json();
    taskData = taskData.tasks;
  }
  return taskData;
}

const rdsApiTaskDetails = (username = null) =>
  `${RDS_API_TASKS_USERS}/${username}`;

const getCloudinaryImgURL = (publicId, configs) => {
  const imageSizeOptions = configs ? `/${configs}` : '';
  return `${RDS_CLOUDINARY_CLOUD_URL}${imageSizeOptions}/${publicId}`;
};

function getUserProfileImageLink(publicId) {
  return publicId
    ? getCloudinaryImgURL(publicId, RDS_PROFILE_IMAGE_SIZE)
    : RDS_PROFILE_DEFAULT_IMAGE;
}

function searchFunction() {
  let divText, txtValue;
  const input = document.getElementById('search-users');
  const filter = input.value.toUpperCase();
  const ul = document.getElementById(USERS_LIST_ID);
  const li = ul.getElementsByTagName('li');
  const liArray = Array.from(li);
  liArray.forEach((liItem) => {
    divText = liItem.getElementsByTagName('div')[0];
    txtValue = divText.textContent || divText.innerText;
    const displayStyle =
      txtValue.toUpperCase().indexOf(filter) > -1 ? '' : 'none';
    liItem.style.display = displayStyle;
  });
}
