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
    console.error('Something went wrong. Please contact admin', err);
    return err;
  }
}

async function getMembersData() {
  let membersList = null;
  const membersRequest = await makeApiCall(RDS_API_MEMBERS);
  if (membersRequest.status === 200) {
    membersList = await membersRequest.json();
    membersList = membersList.members;
    membersList = membersList.filter((member) => !member.incompleteUserDetails);
  }
  return membersList;
}

async function getMemberTaskData(username) {
  let taskData = null;
  const membersRequest = await makeApiCall(rdsApiTaskDetails(username));
  if (membersRequest.status === 200) {
    taskData = await membersRequest.json();
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

function searchFunction() {
  let divText, txtValue;
  const input = document.getElementById('search-members');
  const filter = input.value.toUpperCase();
  const ul = document.getElementById(MEMBERS_LIST_ID);
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
