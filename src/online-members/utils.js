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

const getCloudinaryImgURL = (publicId, configs) =>
  `${RDS_CLOUDINARY_CLOUD_URL}${configs ? `/${configs}` : ''}/${publicId}`;

function searchFunction() {
  // Declare variables
  let divText, i, txtValue;
  const input = document.getElementById('searchMembers');
  const filter = input.value.toUpperCase();
  const ul = document.getElementById(MEMBERS_LIST_ID);
  const li = ul.getElementsByTagName('li');

  for (i = 0; i < li.length; i++) {
    divText = li[i].getElementsByTagName('div')[0];
    txtValue = divText.textContent || divText.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = '';
    } else {
      li[i].style.display = 'none';
    }
  }
}
