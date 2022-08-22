import {
  API_BASE_URL,
  YEARS_OF_EXPERIENCE,
  APPROVE_BUTTON_TEXT,
  REJECT_BUTTON_TEXT,
  APPROVAL_PROMPT_TEXT,
  ALERT_APPROVED,
  ALERT_ERROR,
  ALERT_REJECTED,
} from './constants.js';

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

function formatPropertyField(property) {
  return property
    .split('_')
    .map((x) => x[0].toUpperCase() + x.slice(1))
    .join(' ');
}

function getDataItem(data, itemName) {
  const item = data[itemName];

  if (item) {
    return item;
  } else {
    if (itemName === YEARS_OF_EXPERIENCE && item === 0) return item;
    else return '';
  }
}

function displayList(primaryData, userInfoList, secondaryData) {
  const prevSibling = userInfoList.previousSibling.innerHTML;
  const isOldData = prevSibling.toLowerCase().includes('old');
  const isNewData = prevSibling.toLowerCase().includes('new');

  for (const listItem in primaryData) {
    const oldValue = getDataItem(primaryData, listItem);
    const newValue = getDataItem(secondaryData, listItem);
    const isValueEqual = String(oldValue).trim() === String(newValue).trim();

    let diffClass;
    if (!isValueEqual) {
      diffClass = isOldData ? 'oldDiff' : 'newDiff';
    }

    const innerHTML = `
      <span>${formatPropertyField(listItem)}:</span>
      <span class=${diffClass}>${getDataItem(primaryData, listItem)}</span>
    `;

    const li = createCardComponent({
      tagName: 'li',
      innerHTML,
      parent: userInfoList,
    });
  }
}

function createCard({ oldData, newData, userId, username, profileDiffId }) {
  const wrapper = createCardComponent({
    tagName: 'div',
    className: 'wrapperDiv',
  });

  const footerDiv = document.querySelector('#footer');
  document.body.insertBefore(wrapper, footerDiv);

  const cardContainer = createCardComponent({
    className: 'cardDiv',
    tagName: 'div',
    parent: wrapper,
  });

  const userName = createCardComponent({
    tagName: 'p',
    innerText: `Username: ${username}`,
    className: 'userNameContainer',
    parent: cardContainer,
  });

  const dataContainer = createCardComponent({
    tagName: 'div',
    className: 'dataContainer',
    parent: cardContainer,
  });

  const dataInnerContainer = createCardComponent({
    tagName: 'div',
    className: 'dataInnerContainer',
    parent: dataContainer,
  });

  const oldDataContainer = createCardComponent({
    tagName: 'div',
    className: 'oldDataContainer',
    parent: dataInnerContainer,
  });

  const oldDataHeading = createCardComponent({
    tagName: 'h3',
    innerText: 'Old Data',
    parent: oldDataContainer,
  });

  const oldUserInfoList = createCardComponent({
    tagName: 'ul',
    className: 'userInfoListContainer',
    parent: oldDataContainer,
  });

  displayList(oldData, oldUserInfoList, newData);

  const newDataContainer = createCardComponent({
    tagName: 'div',
    className: 'newDataContainer',
    parent: dataInnerContainer,
  });

  const newDataHeading = createCardComponent({
    tagName: 'h3',
    innerText: 'New Data',
    parent: newDataContainer,
  });

  const newUserInfoList = createCardComponent({
    tagName: 'ul',
    className: 'userInfoListContainer',
    parent: newDataContainer,
  });

  displayList(newData, newUserInfoList, oldData);

  const buttonsContainer = createCardComponent({
    tagName: 'div',
    className: 'buttonsContainer',
    parent: dataContainer,
  });

  const approveBtn = createCardComponent({
    tagName: 'button',
    innerText: APPROVE_BUTTON_TEXT,
    parent: buttonsContainer,
  });
  const rejectBtn = createCardComponent({
    tagName: 'button',
    innerText: REJECT_BUTTON_TEXT,
    parent: buttonsContainer,
  });

  approveBtn.onclick = async () => {
    const reason = prompt(APPROVAL_PROMPT_TEXT);
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
          alert(ALERT_APPROVED);
          window.location.reload();
        } else {
          alert(ALERT_ERROR);
        }
      } catch (error) {
        alert(ALERT_ERROR);
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
          alert(ALERT_REJECTED);
          window.location.reload();
        } else {
          alert(ALERT_ERROR);
        }
      } catch (error) {
        alert(ALERT_ERROR);
      } finally {
        document.getElementById('cover-spin').style.display = 'none';
      }
    }
  };

  document.getElementById('loader').style.display = 'none';
}

function createCardComponent({
  className,
  tagName,
  innerText,
  parent,
  innerHTML,
}) {
  const component = document.createElement(tagName);
  if (className) {
    component.classList.add(className);
  }

  if (innerText) {
    component.innerText = innerText;
  }

  if (innerHTML) {
    component.innerHTML = innerHTML;
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

async function getSelfUser() {
  const res = await fetch(`${API_BASE_URL}/users/self`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });

  const self_user = await res.json();
  return self_user;
}

async function getUser(userId) {
  const userResponse = await fetch(`${API_BASE_URL}/users/userId/${userId}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const { user } = await userResponse.json();
  return user;
}

export { getProfileDiffs, getSelfUser, getUser, wantedData, createCard };
