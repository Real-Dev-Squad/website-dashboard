const photoVerificationRequestContainer = document.querySelector(
  '.photo-verification-requests',
);
const userSearchInput = document.querySelector('#user-search');

async function render() {
  const photoVerificationRequests = await getPhotoVerificationRequests();
  const photoVerificationRequestObjects = photoVerificationRequests.data;
  photoVerificationRequestObjects.forEach((obj) => {
    photoVerificationRequestContainer.append(
      createPhotoVerificationRequestCard(obj),
    );
  });
}

render();

async function onUserSearchInput(e) {
  photoVerificationRequestContainer.innerHTML = '';
  if (e.target.value === '') {
    render();
  }
  const photoVerificationRequests = await getPhotoVerificationRequests(
    e.target.value,
  );
  const photoVerificationRequestObjects = photoVerificationRequests.data;
  photoVerificationRequestContainer.innerHTML = '';
  photoVerificationRequestObjects.forEach((obj) => {
    photoVerificationRequestContainer.append(
      createPhotoVerificationRequestCard(obj),
    );
  });
}

userSearchInput.addEventListener('input', debounce(onUserSearchInput, 500));
