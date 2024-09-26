const CONTAINER = document.querySelector('.container');
let expanded = false;
let profileDetailsContainer;
let reasonHeading;

const toast = document.getElementById('toast');

function showToast({ message, type }) {
  toast.innerText = message;

  if (type === 'success') {
    toast.classList.add('success');
    toast.classList.remove('failure');
  } else {
    toast.classList.add('failure');
    toast.classList.remove('success');
  }

  toast.classList.remove('hidden');
  toast.classList.add('animated_toast');

  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('animated_toast');
  }, 3000);
}

function renderProfileDetails(user, profileDiff) {
  if (profileDetailsContainer) profileDetailsContainer.remove();
  profileDetailsContainer = createElement({
    type: 'div',
    attributes: { class: 'profile-details-container' },
  });

  CONTAINER.insertBefore(profileDetailsContainer, reasonHeading);

  const { id, ...oldData } = wantedData(user);
  const { id: profileDiffId, ...newData } = wantedData(profileDiff);

  const difference = checkDifferentValues(oldData, newData);

  const fields = [
    'first_name',
    'last_name',
    'designation',
    'company',
    'yoe',
    'email',
    'phone',
    'linkedin_id',
    'github_id',
    'twitter_id',
    'instagram_id',
    'website',
  ];

  let i = 0;
  fields.forEach((field, index) => {
    if (difference.has(field) || expanded) {
      i++;
      const profileDetailsListItem = createElement({
        type: 'div',
        attributes: {
          class: `profile-details-list-item ${
            expanded
              ? fields.length - 1 === index
                ? 'profile-details-border-none'
                : ''
              : i === difference.size
              ? 'profile-details-border-none'
              : ''
          }`,
        },
      });

      const profileDetailsName = createElement({
        type: 'div',
        attributes: { class: 'profile-details-name' },
      });

      profileDetailsName.innerHTML = fieldDisplayName[field];
      profileDetailsListItem.appendChild(profileDetailsName);
      if (difference.has(field)) {
        const profileDetailsOldData = createElement({
          type: 'div',
          attributes: { class: 'profile-details-old-data' },
        });
        profileDetailsOldData.innerHTML = oldData[field] || '—';

        const profileDetailsNewData = createElement({
          type: 'div',
          attributes: { class: 'profile-details-new-data' },
        });
        profileDetailsNewData.innerHTML = newData[field] || '';

        profileDetailsListItem.appendChild(profileDetailsOldData);
        profileDetailsListItem.appendChild(profileDetailsNewData);
      } else {
        const profileDetailsData = createElement({
          type: 'div',
          attributes: { class: 'profile-details-data' },
        });
        profileDetailsData.innerHTML = oldData[field] || '';
        profileDetailsListItem.appendChild(profileDetailsData);
      }
      profileDetailsContainer.appendChild(profileDetailsListItem);
    }
  });
}

async function setUser(profileDiff) {
  let user;
  try {
    user = await fetchUser(profileDiff.userId);
  } catch (err) {}
  if (!user.userExist) {
  }

  CONTAINER.innerHTML = '';

  const displayImage = createElement({
    type: 'img',
    attributes: {
      class: 'user_image',
      src: user.picture.url,
      height: '71px',
      width: '71px',
    },
  });
  CONTAINER.appendChild(displayImage);

  const username = createElement({
    type: 'div',
    attributes: {
      class: 'user_name',
    },
  });
  username.innerHTML = `${user.first_name} ${user.last_name}`;
  CONTAINER.appendChild(username);

  const expandControlContainer = createElement({
    type: 'div',
    attributes: { class: 'expand-control-container' },
  });
  const expandTextDiv = createElement({
    type: 'div',
    attributes: { class: 'expand-control-text' },
  });
  expandControlContainer.appendChild(expandTextDiv);
  expandTextDiv.innerHTML = `See ${
    expanded ? 'Less' : 'All'
  }<i class="fa fa-chevron-${
    expanded ? 'up' : 'down'
  } expand-control-icon"></i>`;

  expandTextDiv.addEventListener('click', () => {
    expanded = !expanded;
    expandTextDiv.innerHTML = `See ${
      expanded ? 'Less' : 'All'
    }<i class="fa fa-chevron-${
      expanded ? 'up' : 'down'
    } expand-control-icon"></i>`;
    renderProfileDetails(user, profileDiff);
  });
  CONTAINER.appendChild(expandControlContainer);
  renderProfileDetails(user, profileDiff);
  reasonHeading = createElement({
    type: 'p',
    attributes: {
      class: 'reason_heading',
    },
  });
  reasonHeading.innerHTML = 'Reason ( Optional )';
  CONTAINER.appendChild(reasonHeading);

  const reasonTextArea = createElement({
    type: 'textarea',
    attributes: {
      class: 'reason_textarea',
      rows: 4,
    },
  });
  CONTAINER.appendChild(reasonTextArea);

  const buttonsDiv = createElement({
    type: 'div',
    attributes: {
      class: 'button__container',
    },
  });

  const approvalButton = createElement({
    type: 'button',
    attributes: {
      class: 'button__approve',
    },
  });
  approvalButton.innerHTML = 'Approve';
  buttonsDiv.appendChild(approvalButton);

  const rejectButton = createElement({
    type: 'button',
    attributes: {
      class: 'button__reject',
    },
  });
  rejectButton.innerHTML = 'Reject';
  buttonsDiv.appendChild(rejectButton);

  approvalButton.onclick = async () => {
    approvalButton.innerHTML = '<div class="button__loader"></div>';
    approvalButton.disabled = true;
    rejectButton.disabled = true;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: profileDiff.id,
          message: reasonTextArea.value,
        }),
      });

      if (response.ok) {
        showToast({
          type: 'success',
          message: 'The Profile changes are Approved!',
        });
        setTimeout(() => {
          window.location.href = '/profile-diffs';
        }, 3000);
      } else {
        showToast({ type: 'error', message: 'Something went wrong!' });
        approvalButton.innerHTML = 'Approve';
        approvalButton.disabled = false;
        rejectButton.disabled = false;
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Something went wrong!' });
      approvalButton.innerHTML = 'Approve';
      approvalButton.disabled = false;
      rejectButton.disabled = false;
    }
  };

  rejectButton.onclick = async () => {
    rejectButton.innerHTML = '<div class="button__loader"></div>';
    approvalButton.disabled = true;
    rejectButton.disabled = true;
    try {
      const response = await fetch(`${API_BASE_URL}/users/rejectDiff`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          profileDiffId: profileDiff.id,
          message: reasonTextArea.value,
        }),
      });

      if (response.ok) {
        showToast({
          type: 'success',
          message: 'The Profile changes are Rejected!',
        });
        setTimeout(() => {
          window.location.href = '/profile-diffs';
        }, 3000);
      } else {
        showToast({ type: 'error', message: 'Something went wrong!' });
        rejectButton.innerHTML = 'Reject';
        approvalButton.disabled = false;
        rejectButton.disabled = false;
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Something went wrong!' });
      rejectButton.innerHTML = 'Reject';
      approvalButton.disabled = false;
      rejectButton.disabled = false;
    }
  };

  CONTAINER.appendChild(buttonsDiv);
}

async function render() {
  CONTAINER.innerHTML = '<div class="loader"></div>';
  const id = new URLSearchParams(window.location.search).get('id');
  if (id) {
    let profileDiff;
    try {
      profileDiff = await getProfileDiff(id);
    } catch {
      CONTAINER.innerHTML = 'Something went wrong fetching Profile Diff!';
      return;
    }
    if (profileDiff.notAuthorized) {
      CONTAINER.innerHTML = 'You are not AUTHORIZED to view this page!';
      return;
    }
    if (!profileDiff.profileDiffExist) {
      CONTAINER.innerHTML = 'Profile Diff not found!';
      return;
    }
    if (profileDiff.approval === Status.PENDING) {
      await setUser(profileDiff);
    } else {
      CONTAINER.innerHTML = `The request status is ${profileDiff.approval}`;
    }
  } else {
    CONTAINER.innerHTML = `No id found!`;
  }
}

render();
