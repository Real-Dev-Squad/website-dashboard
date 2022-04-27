const API_BASE_URL = 'https://api.realdevsquad.com';

async function getProfileDiffs() {
  try {
    const profileDiffsResponse = await fetch(`${API_BASE_URL}/profileDiffs`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    const { profileDiffs } = await profileDiffsResponse.json();
    return { profileDiffs };
  } catch (error) {
    alert(`Error: ${error}`);
  }
}

const wrapper = document.createElement('div');
wrapper.classList.add('wrapperDiv');

//fixing footer at bottom to handle even if there is no data present
const footerDiv = document.querySelector('#footer');
document.body.insertBefore(wrapper, footerDiv);

//resusable function to extract the key property field and displaying the data
function formatPropertyField(property) {
  return property
    .split('_')
    .map((x) => x[0].toUpperCase() + x.slice(1))
    .join(' ');
}

function createCard({ oldData, newData, userId, username, profileDiffId }) {
  const cardContainer = createCardComponent({
    className: 'cardDiv',
    tagName: 'div',
    parent: wrapper,
  });

  const userName = document.createElement('p');
  userName.classList.add('userNameContainer');
  cardContainer.appendChild(userName);
  userName.innerText = `Username: ${username}`;

  const dataContainer = document.createElement('div');
  dataContainer.classList.add('dataContainer');
  cardContainer.appendChild(dataContainer);

  const dataInnerContainer = document.createElement('div');
  dataInnerContainer.classList.add('dataInnerContainer');
  dataContainer.appendChild(dataInnerContainer);

  const oldDataContainer = document.createElement('div');
  oldDataContainer.classList.add('oldDataContainer');
  dataInnerContainer.appendChild(oldDataContainer);

  const oldDataHeading = document.createElement('h3');
  oldDataHeading.innerText = 'Old Data';
  oldDataContainer.appendChild(oldDataHeading);

  const oldUserInfoList = document.createElement('ul');
  oldUserInfoList.classList.add('userInfoListContainer');
  oldDataContainer.appendChild(oldUserInfoList);

  //looping through the old data to display in list
  for (const listItem in oldData) {
    const li = document.createElement('li');
    li.innerText = `${formatPropertyField(listItem)}: ${
      oldData[listItem] || (listItem === 'yoe' ? '' : '')
    }`;
    oldUserInfoList.appendChild(li);
  }

  const newDataContainer = document.createElement('div');
  newDataContainer.classList.add('newDataContainer');
  dataInnerContainer.appendChild(newDataContainer);

  const newDataHeading = document.createElement('h3');
  newDataHeading.innerText = 'New Data';
  newDataContainer.appendChild(newDataHeading);

  const newUserInfoList = document.createElement('ul');
  newUserInfoList.classList.add('userInfoListContainer');
  newDataContainer.appendChild(newUserInfoList);

  //looping through the new data to display in list
  for (const listItem in newData) {
    const li = document.createElement('li');
    li.innerText = `${formatPropertyField(listItem)}: ${
      newData[listItem] || (listItem === 'yoe' ? '' : '')
    }`;
    newUserInfoList.appendChild(li);
  }

  const buttonsContainer = document.createElement('div');
  buttonsContainer.classList.add('buttonsContainer');
  dataContainer.appendChild(buttonsContainer);

  const approveBtn = document.createElement('button');
  const rejectBtn = document.createElement('button');
  approveBtn.innerText = 'Approve';
  rejectBtn.innerText = 'Reject';

  approveBtn.onclick = async () => {
    const reason = prompt('Reason for Approval');
    if (reason != null) {
      document.getElementById('cover-spin').style.display = 'block';
      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            id: profileDiffId,
            message: reason,
          }),
        });

        if (response.ok) {
          alert('User Data Approved !!!');
          window.location.reload();
        } else {
          alert('Something went wrong. Please check console errors.');
        }
      } catch (error) {
        alert('Something went wrong. Please check console errors.');
      } finally {
        document.getElementById('cover-spin').style.display = 'none';
      }
    }
  };

  rejectBtn.onclick = async () => {
    const reason = prompt('Reason for Rejection');
    if (reason != null) {
      document.getElementById('cover-spin').style.display = 'block';
      try {
        const response = await fetch(`${API_BASE_URL}/users/rejectDiff`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            profileDiffId,
            message: reason,
          }),
        });

        if (response.ok) {
          alert('User Data Rejected!!!');
          window.location.reload();
        } else {
          alert('Something went wrong. Please check console errors.');
        }
      } catch (error) {
        alert('Something went wrong. Please check console errors.');
      } finally {
        document.getElementById('cover-spin').style.display = 'none';
      }
    }
  };

  buttonsContainer.appendChild(approveBtn);
  buttonsContainer.appendChild(rejectBtn);
  document.getElementById('loader').style.display = 'none';
}

// creating a resuable card container component for showing multiple cards
function createCardComponent({ className, tagName, innerText, parent }) {
  const component = document.createElement(tagName);
  if (className) {
    component.classList.add(className);
  }

  if (innerText) {
    component.innerText = innerText;
  }

  if (parent) {
    parent.appendChild(component);
  }

  return component;
}

function wantedData(data) {
  const {
    id,
    first_name,
    last_name,
    email,
    phone,
    yoe,
    company,
    designation,
    github_id,
    linkedin_id,
    twitter_id,
    instagram_id,
    website,
  } = data;
  return {
    id,
    first_name,
    last_name,
    email,
    phone,
    yoe,
    company,
    designation,
    github_id,
    linkedin_id,
    twitter_id,
    instagram_id,
    website,
  };
}

async function createPage() {
  const res = await fetch(`${API_BASE_URL}/users/self`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });

  const self_user = await res.json();

  if (self_user?.roles['super_user']) {
    const { profileDiffs } = await getProfileDiffs();
    if (profileDiffs === undefined || profileDiffs.length === 0) {
      document.getElementById('loader').innerHTML = 'No Profile Diffs !!!';
    } else {
      profileDiffs.forEach(async (profileDiff) => {
        const { userId } = profileDiff;
        const userResponse = await fetch(
          `${API_BASE_URL}/users/userId/${userId}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-type': 'application/json',
            },
          },
        );

        const { user } = await userResponse.json();
        const { username } = user;

        const { id, ...oldData } = wantedData(user);
        const { id: profileDiffId, ...newData } = wantedData(profileDiff);

        createCard({ oldData, newData, userId, username, profileDiffId });
      });
    }
  } else {
    document.getElementById('loader').innerHTML = 'You are not authorized !';
  }
}

createPage();
