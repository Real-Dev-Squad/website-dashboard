async function refreshDiscordImage(discordId, id) {
  const res = await refreshDiscordImageRequest(discordId);
  const card = document.querySelector(`.photo-verification-card--${id}`);
  const discordImage = card.querySelector(
    '.photo-verification-image-box__block--discord img',
  );

  if (res.statusCode === 200) {
    discordImage.src = res.data.discordAvatarUrl;
  }
}

async function approvePhotoVerificationRequest(id, userId, imageType) {
  const res = await modifyPhotoVerificationRequest(
    userId,
    imageType,
    'APPROVED',
  );
  const card = document.querySelector(`.photo-verification-card--${id}`);
  const message = document.createElement('p');
  message.innerText = res.data.message;

  card.appendChild(message);

  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

async function rejectPhotoVerificationRequest(id, userId) {
  const res = await modifyPhotoVerificationRequest(userId, 'both', 'REJECTED');
  const card = document.querySelector(`.photo-verification-card--${id}`);
  const message = document.createElement('p');
  message.innerText = res.data.message;

  card.appendChild(message);

  if (res.statusCode === 200) {
    setTimeout(() => {
      card.remove();
    }, 2000);
  }
}

function notifyPhotoVerificationRequest(id) {
  console.log(id, 'method to be implemented on the backend');
}

function createPhotoVerificationRequestImageBox(
  prevImage,
  newImage,
  discordImage,
) {
  const imageBox = document.createElement('div');
  imageBox.className = 'photo-verification-image-box';

  const prevImageBox = document.createElement('div');
  prevImageBox.className = 'photo-verification-image-box__block';
  prevImageBox.innerHTML = `<h4>Previous Image</h4><img src="${prevImage}" alt="Previous Image" />`;
  imageBox.appendChild(prevImageBox);

  const newImageBox = document.createElement('div');
  newImageBox.className = 'photo-verification-image-box__block';
  newImageBox.innerHTML = `<h4>New Image</h4><img src="${newImage}" alt="New Image" />`;
  imageBox.appendChild(newImageBox);

  const discordImageBox = document.createElement('div');
  discordImageBox.className =
    'photo-verification-image-box__block photo-verification-image-box__block--discord';
  discordImageBox.innerHTML = `<h4>Discord Image</h4><img src="${discordImage}" alt="Discord Image" />`;
  imageBox.appendChild(discordImageBox);

  return imageBox;
}

function createPhotoVerificationRequestButtonBox(
  approvePhoto,
  rejectPhoto,
  notifyPhoto,
  refreshDiscordAvatarPhoto,
  discordImageStatus,
  profileImageStatus,
) {
  const buttonBox = document.createElement('div');
  buttonBox.className = 'photo-verification-button-box';

  if (!discordImageStatus) {
    const approveDiscordButton = document.createElement('button');
    approveDiscordButton.innerText = 'Approve Discord';
    approveDiscordButton.onclick = () => approvePhoto('discord');
    buttonBox.appendChild(approveDiscordButton);
  }

  if (!profileImageStatus) {
    const approveProfileButton = document.createElement('button');
    approveProfileButton.innerText = 'Approve Profile';
    approveProfileButton.onclick = () => approvePhoto('profile');
    buttonBox.appendChild(approveProfileButton);
  }

  const approveBothButton = document.createElement('button');
  approveBothButton.innerText = 'Approve Both';
  approveBothButton.className = 'approve-both-button';
  approveBothButton.onclick = () => approvePhoto('both');
  buttonBox.appendChild(approveBothButton);

  const rejectButton = document.createElement('button');
  rejectButton.innerText = 'Reject';
  rejectButton.className = 'reject-button';
  rejectButton.onclick = rejectPhoto;
  buttonBox.appendChild(rejectButton);

  const refreshDiscordAvatarButton = document.createElement('button');
  refreshDiscordAvatarButton.innerText = 'Refresh Discord Image';
  refreshDiscordAvatarButton.onclick = refreshDiscordAvatarPhoto;
  refreshDiscordAvatarButton.className = 'refresh-discord-avatar-button';
  buttonBox.appendChild(refreshDiscordAvatarButton);

  const notifyButton = document.createElement('button');
  notifyButton.innerText = 'Notify User';
  notifyButton.onclick = notifyPhoto;
  notifyButton.className = 'notify-button';
  notifyButton.disabled = true;
  buttonBox.appendChild(notifyButton);

  return buttonBox;
}

function createPhotoVerificationRequestStatusBox(
  discordImageStatus,
  profileImageStatus,
) {
  const statusBox = document.createElement('div');
  statusBox.className = 'photo-verification-status-box';

  const statusHeading = document.createElement('h3');
  statusHeading.innerText = 'Status';
  statusBox.appendChild(statusHeading);

  const statusBoxContent = document.createElement('div');
  statusBoxContent.className = `photo-verification-status-box__block`;
  statusBoxContent.innerHTML = `<h4>Discord Image - ${
    discordImageStatus ? 'Approved' : 'Pending'
  }</h4><h4>Profile Image - ${
    profileImageStatus ? 'Approved' : 'Pending'
  }</h4>`;
  statusBox.appendChild(statusBoxContent);

  return statusBox;
}

function createPhotoVerificationRequestCard(photoVerificationRequest) {
  const card = document.createElement('div');
  card.className = `photo-verification-card photo-verification-card--${photoVerificationRequest.id}`;

  const heading = document.createElement('h3');
  heading.innerText = `Photo Verifcation for ${photoVerificationRequest.user?.username}`;
  card.appendChild(heading);

  card.appendChild(
    createPhotoVerificationRequestImageBox(
      photoVerificationRequest.user.picture,
      photoVerificationRequest.profile.url,
      photoVerificationRequest.discord.url,
    ),
  );

  card.appendChild(
    createPhotoVerificationRequestStatusBox(
      photoVerificationRequest.discord.approved,
      photoVerificationRequest.profile.approved,
    ),
  );

  card.appendChild(
    createPhotoVerificationRequestButtonBox(
      (imageType) =>
        approvePhotoVerificationRequest(
          photoVerificationRequest.id,
          photoVerificationRequest.userId,
          imageType,
        ),
      () =>
        rejectPhotoVerificationRequest(
          photoVerificationRequest.id,
          photoVerificationRequest.userId,
        ),
      () => notifyPhotoVerificationRequest(photoVerificationRequest.id),
      () =>
        refreshDiscordImage(
          photoVerificationRequest.discordId,
          photoVerificationRequest.id,
        ),
      photoVerificationRequest.discord.approved,
      photoVerificationRequest.profile.approved,
    ),
  );

  return card;
}

async function getPhotoVerificationRequests(username) {
  let url = `${API_BASE_URL}/users/picture/all/`;
  if (username) {
    url += `?username=${username}`;
  }

  const response = await fetch(url, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  return await response.json();
}

async function modifyPhotoVerificationRequest(userId, imageType, status) {
  const response = await fetch(
    `${API_BASE_URL}/users/picture/verify/${userId}/?status=${status}&type=${imageType}`,
    {
      credentials: 'include',
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
      },
    },
  );
  return { data: await response.json(), statusCode: response.status };
}

async function refreshDiscordImageRequest(discordId) {
  const response = await fetch(
    `${API_BASE_URL}/discord-actions/avatar/photo-verification-update/${discordId}`,
    {
      credentials: 'include',
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
      },
    },
  );
  return { data: await response.json(), statusCode: response.status };
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
