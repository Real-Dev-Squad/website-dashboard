import {
  API_BASE_URL,
  YEARS_OF_EXPERIENCE,
  APPROVE_BUTTON_TEXT,
  REJECT_BUTTON_TEXT,
  APPROVAL_PROMPT_TEXT,
  ALERT_APPROVED,
  ALERT_ERROR,
  ALERT_REJECTED,
  OLD_DATA,
  NEW_DATA,
  DIFF_CLASS,
  OLD_DIFF_CLASS,
  NEW_DIFF_CLASS,
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

function checkDifferentValues(primaryData, secondaryData) {
  const diffValues = new Set();

  for (const listItem in primaryData) {
    const oldValue = getDataItem(primaryData, listItem);
    const newValue = getDataItem(secondaryData, listItem);
    const isValueEqual = String(oldValue).trim() === String(newValue).trim();

    if (!isValueEqual) {
      diffValues.add(listItem);
    }
  }

  return diffValues;
}

function displayList(profileData, userInfoList, diffValues, listType) {
  for (const listItem in profileData) {
    let diffClass;
    if (diffValues.has(listItem)) {
      diffClass = listType === OLD_DATA ? OLD_DIFF_CLASS : NEW_DIFF_CLASS;
    }

    const fragment = new DocumentFragment();

    const spanKey = createCardComponent({
      tagName: 'span',
      innerText: `${formatPropertyField(listItem)}: `,
      parent: fragment,
    });

    const spanValue = createCardComponent({
      tagName: 'span',
      innerText: `${getDataItem(profileData, listItem)}`,
      classNames: diffClass ? [DIFF_CLASS, diffClass] : '',
      parent: fragment,
    });

    const li = createCardComponent({
      tagName: 'li',
      parent: userInfoList,
      child: fragment,
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

  const diffValues = checkDifferentValues(oldData, newData);

  const oldUserInfoList = createCardComponent({
    tagName: 'ul',
    className: 'userInfoListContainer',
    parent: oldDataContainer,
  });

  displayList(oldData, oldUserInfoList, diffValues, OLD_DATA);

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

  displayList(newData, newUserInfoList, diffValues, NEW_DATA);

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
  classNames,
  tagName,
  innerText,
  parent,
  child,
}) {
  const component = document.createElement(tagName);
  if (className) {
    component.classList.add(className);
  }

  if (classNames) {
    classNames.forEach((c) => component.classList.add(c));
  }

  if (innerText) {
    component.innerText = innerText;
  }

  if (parent) {
    parent.appendChild(component);
  }

  if (child) {
    component.appendChild(child);
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
